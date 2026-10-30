import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  detectSessionFromTime,
  syncBiasValues
} from '../utils/researchAnalytics'
import type {
  ResearchSession,
  ResearchCustomColumn,
  ResearchEntryInput
} from '../../../shared/types'

export interface ZoneFormField {
  id?: number
  customColumnId: number
  customColumnName: string
  zoneInstanceName?: string | null
  bias: 'Bullish' | 'Bearish' | ''
  entryDatetime?: string | null
  exitDatetime?: string | null
  holdingDurationMinutes?: number | null
  holdingBars?: number | null
  minRr: number | null
  maxRr: number | null
  slPoints: number | null
  realSlPoints: number | null
  minSlPoints?: number | null
  maxSlPoints?: number | null
  isMissed: boolean
  isNoZone: boolean
  invalidationReason?: string | null
  outcome: 'win' | 'loss' | 'be' | 'missed' | 'no_zone' | ''
  notes?: string
}

export const useResearchEntryStore = defineStore('researchEntry', () => {
  // Available selections
  const setups = ref<any[]>([])
  const symbols = ref<any[]>([])

  // Active Setup configurations
  const activeSetupSessions = ref<ResearchSession[]>([])
  const activeLinkedColumns = ref<ResearchCustomColumn[]>([])
  const enableExitDate = ref(false)

  // Separated zone columns (Zone Group) and regular field columns (checkbox, selectors, text, number)
  const zoneColumns = computed(() => {
    return activeLinkedColumns.value.filter((col) => !col.type || col.type === 'zone_group')
  })

  const fieldColumns = computed(() => {
    return activeLinkedColumns.value.filter((col) => col.type && col.type !== 'zone_group')
  })

  // Custom data values for field columns
  const customData = ref<Record<string | number, any>>({})

  // Current Form state
  const editingEntryId = ref<number | null>(null)
  const isEditMode = computed(() => editingEntryId.value !== null)
  const setupId = ref<number | null>(null)
  const symbolId = ref<number | null>(null)

  // Default entry time: local YYYY-MM-DDTHH:mm
  const getNowLocalDatetime = () => {
    const now = new Date()
    const offset = now.getTimezoneOffset() * 60000
    const local = new Date(now.getTime() - offset)
    return local.toISOString().slice(0, 16)
  }

  const initialNow = getNowLocalDatetime()
  const entryDatetime = ref(initialNow)
  const exitDatetime = ref<string | null>(initialNow)
  const sessionName = ref<string | null>(null)
  const timeframe = ref('M15')
  const news = ref(false)
  const quality = ref('A')
  const notes = ref('')
  const images = ref<string[]>([])

  // Custom Columns Zones for this trade
  const zones = ref<ZoneFormField[]>([])

  const isSubmitting = ref(false)
  const submitError = ref<string | null>(null)

  // Check if form is valid for submission
  const isValid = computed(() => {
    return Boolean(setupId.value && symbolId.value && entryDatetime.value)
  })

  // Initialize reference data (setups, symbols)
  const initialize = async () => {
    try {
      const [setupsRes, symbolsRes] = await Promise.all([
        window.api.research.setups.list(),
        window.api.symbols.list()
      ])

      if (setupsRes.success && setupsRes.data) {
        setups.value = setupsRes.data
        if (setups.value.length > 0 && !setupId.value) {
          await onSelectSetup(setups.value[0].id)
        }
      }

      if (symbolsRes.success && symbolsRes.data) {
        symbols.value = symbolsRes.data
        if (symbols.value.length > 0 && !symbolId.value) {
          symbolId.value = symbols.value[0].id
        }
      }
    } catch (err: any) {
      console.error('Failed to initialize research entry store:', err)
    }
  }

  // Handle Setup selection
  const onSelectSetup = async (newSetupId: number) => {
    setupId.value = newSetupId
    try {
      const res = await window.api.research.setups.getDetails(newSetupId)
      if (res.success && res.data) {
        enableExitDate.value = Boolean(res.data.enableExitDate)
        activeSetupSessions.value = res.data.sessions || []
        activeLinkedColumns.value = res.data.customColumns || []

        // Reset or populate zones array based on linked zone columns only
        zones.value = zoneColumns.value.map((col) => ({
          customColumnId: col.id,
          customColumnName: col.name,
          zoneInstanceName: null,
          bias: 'Bullish',
          entryDatetime: entryDatetime.value || null,
          exitDatetime: exitDatetime.value || entryDatetime.value || null,
          holdingDurationMinutes:
            entryDatetime.value && exitDatetime.value && entryDatetime.value === exitDatetime.value ? 0 : null,
          holdingBars: null,
          minRr: null,
          maxRr: null,
          slPoints: null,
          realSlPoints: null,
          minSlPoints: null,
          maxSlPoints: null,
          isMissed: false,
          isNoZone: false,
          invalidationReason: null,
          outcome: '',
          notes: ''
        }))

        // Reset or initialize customData for field columns
        const newCustomData: Record<string | number, any> = {}
        for (const col of fieldColumns.value) {
          if (col.type === 'checkbox') {
            newCustomData[col.id] = col.defaultValue !== undefined ? Boolean(col.defaultValue) : false
          } else if (col.type === 'multiple_selector') {
            newCustomData[col.id] = Array.isArray(col.defaultValue) ? col.defaultValue : []
          } else {
            newCustomData[col.id] = col.defaultValue ?? null
          }
        }
        customData.value = newCustomData

        // Auto-detect session for current datetime
        recalculateSession()
      }
    } catch (err: any) {
      console.error('Failed to load setup details for entry form:', err)
    }
  }

  // Auto-detect session
  const recalculateSession = () => {
    if (!entryDatetime.value) return
    const detected = detectSessionFromTime(entryDatetime.value, activeSetupSessions.value)
    if (detected) {
      sessionName.value = detected
    }
  }

  // Handle entry datetime change: auto-detects session and auto-copies value to exit datetime and all zones
  const onEntryDatetimeChange = () => {
    recalculateSession()
    if (entryDatetime.value) {
      exitDatetime.value = entryDatetime.value
      // Copy to all zones' entry and exit times so user doesn't have to select date & time repeatedly
      for (const z of zones.value) {
        z.entryDatetime = entryDatetime.value
        z.exitDatetime = entryDatetime.value
        z.holdingDurationMinutes = 0
      }
    }
  }

  // Handle main exit datetime change: syncs to all zones and recalculates holding durations
  const onExitDatetimeChange = () => {
    if (exitDatetime.value) {
      for (const z of zones.value) {
        z.exitDatetime = exitDatetime.value
        if (z.entryDatetime) {
          try {
            const start = new Date(z.entryDatetime).getTime()
            const end = new Date(exitDatetime.value).getTime()
            if (!isNaN(start) && !isNaN(end) && end >= start) {
              z.holdingDurationMinutes = Math.round((end - start) / (1000 * 60))
            }
          } catch {}
        }
      }
    }
  }

  // Bias change handler (Rule 4.1: First column syncs all, others override)
  const onBiasChange = (index: number, newBias: 'Bullish' | 'Bearish') => {
    zones.value = syncBiasValues(zones.value, index, newBias)
  }

  // SL Points change handlers (Planned SL & Real Drawdown / MAE)
  const onSlPointsChange = (index: number, val: number | null) => {
    if (!zones.value[index]) return
    zones.value[index].slPoints = val
    zones.value[index].minSlPoints = val
  }

  const onRealSlPointsChange = (index: number, val: number | null) => {
    if (!zones.value[index]) return
    zones.value[index].realSlPoints = val
    zones.value[index].maxSlPoints = val
  }

  // Backward compatibility aliases
  const onMinSlPointsChange = onSlPointsChange
  const onMaxSlPointsChange = onRealSlPointsChange

  // Duplicate zone (allows multiple instances of the same zone type, e.g. Breaker Block #2)
  const duplicateZone = (index: number) => {
    const source = zones.value[index]
    if (!source) return
    const countSameType = zones.value.filter((z) => z.customColumnId === source.customColumnId).length
    const newZone: ZoneFormField = {
      ...source,
      id: undefined,
      zoneInstanceName: `${source.customColumnName} #${countSameType + 1}`,
      entryDatetime: source.entryDatetime || entryDatetime.value || null,
      exitDatetime: null,
      holdingDurationMinutes: null,
      holdingBars: null,
      minRr: null,
      maxRr: null,
      realSlPoints: null,
      isMissed: false,
      isNoZone: false,
      invalidationReason: null,
      outcome: '',
      notes: ''
    }
    zones.value.splice(index + 1, 0, newZone)
  }

  // Remove duplicated zone
  const removeDuplicatedZone = (index: number) => {
    const target = zones.value[index]
    if (!target) return
    const countSameType = zones.value.filter((z) => z.customColumnId === target.customColumnId).length
    if (countSameType <= 1) return // Do not remove original primary zone
    zones.value.splice(index, 1)
  }

  // Toggle "No Zone" (ไม่เกิดโซน)
  const toggleZoneNoZone = (index: number) => {
    const z = zones.value[index]
    if (!z) return
    z.isNoZone = !z.isNoZone
    if (z.isNoZone) {
      z.isMissed = false
      z.minRr = null
      z.maxRr = null
      z.realSlPoints = null
      z.invalidationReason = null
      z.outcome = 'no_zone'
    } else {
      z.outcome = ''
    }
  }

  // Quick action: Loss = -1 (Rule 4.7)
  const setZoneLoss = (index: number, reason?: string) => {
    const z = zones.value[index]
    if (!z) return
    z.isMissed = false
    z.isNoZone = false
    z.minRr = -1
    z.maxRr = -1
    z.realSlPoints = null // Clear real SL on loss (leave blank)
    z.maxSlPoints = null
    z.outcome = 'loss'
    if (reason !== undefined) {
      z.invalidationReason = reason
    }
  }

  const setZoneInvalidationReason = (index: number, reason: string) => {
    const z = zones.value[index]
    if (!z) return
    z.invalidationReason = z.invalidationReason === reason ? null : reason
  }

  // Auto calculate holding duration from zone entry and exit times
  const onZoneTimeChange = (index: number) => {
    const z = zones.value[index]
    if (!z) return
    if (z.entryDatetime && z.exitDatetime) {
      try {
        const start = new Date(z.entryDatetime).getTime()
        const end = new Date(z.exitDatetime).getTime()
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          z.holdingDurationMinutes = Math.round((end - start) / (1000 * 60))
        }
      } catch {}
    }
  }

  // Handle zone entry datetime change: if zone 0 is changed, auto-sync to all time fields across all zones
  const onZoneEntryDatetimeChange = (index: number) => {
    const z = zones.value[index]
    if (!z) return
    const newTime = z.entryDatetime

    if (index === 0 && newTime) {
      entryDatetime.value = newTime
      exitDatetime.value = newTime
      z.exitDatetime = newTime
      z.holdingDurationMinutes = 0
      recalculateSession()

      for (let i = 1; i < zones.value.length; i++) {
        zones.value[i].entryDatetime = newTime
        zones.value[i].exitDatetime = newTime
        zones.value[i].holdingDurationMinutes = 0
      }
    } else {
      if (newTime && !z.exitDatetime) {
        z.exitDatetime = newTime
      }
      onZoneTimeChange(index)
    }
  }

  // Handle zone exit datetime change: if zone 0 is changed, auto-sync exit times across all zones
  const onZoneExitDatetimeChange = (index: number) => {
    const z = zones.value[index]
    if (!z) return
    const newExit = z.exitDatetime

    if (index === 0 && newExit) {
      exitDatetime.value = newExit
      onZoneTimeChange(0)

      for (let i = 1; i < zones.value.length; i++) {
        zones.value[i].exitDatetime = newExit
        onZoneTimeChange(i)
      }
    } else {
      onZoneTimeChange(index)
    }
  }

  // Quick action: Break-Even = 0
  const setZoneBe = (index: number) => {
    const z = zones.value[index]
    if (!z) return
    z.isMissed = false
    z.isNoZone = false
    z.minRr = 0
    if (z.maxRr === null || z.maxRr < 0) {
      z.maxRr = 1
    }
    z.outcome = 'be'
  }

  // Quick action: Missed (Rule 4.4)
  const setZoneMissed = (index: number) => {
    const z = zones.value[index]
    if (!z) return
    z.isMissed = !z.isMissed
    if (z.isMissed) {
      z.isNoZone = false
      z.minRr = null
      z.maxRr = null
      z.realSlPoints = null
      z.maxSlPoints = null
      z.invalidationReason = null
      z.outcome = 'missed'
    } else {
      z.outcome = ''
    }
  }

  // Quick action: Quick Fill RR
  const setZoneQuickRr = (index: number, rr: number) => {
    const z = zones.value[index]
    if (!z) return
    z.isMissed = false
    z.minRr = rr
    if (z.maxRr === null || z.maxRr < rr) {
      z.maxRr = rr
    }
    z.outcome = 'win'
  }

  // Image Upload helper
  const uploadImageFile = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer()
      const res = await window.api.images.save(buffer, file.name)
      if (res.success && res.data) {
        images.value.push(res.data)
        return { success: true }
      }
      return { success: false, error: res.error }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  const addImageUrl = (url: string) => {
    if (!url.trim()) return
    images.value.push(url.trim())
  }

  const removeImage = (index: number) => {
    images.value.splice(index, 1)
  }

  // Load an existing entry for editing
  const loadEntryForEdit = async (id: number) => {
    isSubmitting.value = true
    submitError.value = null
    try {
      if (setups.value.length === 0 || symbols.value.length === 0) {
        await initialize()
      }

      const res = await window.api.research.entries.get(id)
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Research entry not found')
      }

      const entry = res.data
      editingEntryId.value = entry.id
      setupId.value = entry.setupId
      symbolId.value = entry.symbolId
      entryDatetime.value = entry.entryDatetime
      exitDatetime.value = entry.exitDatetime || null
      sessionName.value = entry.sessionName || null
      timeframe.value = entry.timeframe || 'M15'
      news.value = Boolean(entry.news)
      quality.value = entry.quality || 'A'
      notes.value = entry.notes || ''
      images.value = Array.isArray(entry.images) ? [...entry.images] : []

      // Load setup configuration
      const setupRes = await window.api.research.setups.getDetails(entry.setupId)
      if (setupRes.success && setupRes.data) {
        enableExitDate.value = Boolean(setupRes.data.enableExitDate)
        activeSetupSessions.value = setupRes.data.sessions || []
        activeLinkedColumns.value = setupRes.data.customColumns || []
      }

      // Load zones: map all saved instances directly so duplicated zones are restored
      if (entry.zones && entry.zones.length > 0) {
        zones.value = entry.zones.map((z: any) => ({
          id: z.id,
          customColumnId: z.customColumnId,
          customColumnName: z.customColumnName || `Zone #${z.customColumnId}`,
          zoneInstanceName: z.zoneInstanceName || null,
          bias: (z.bias as any) || 'Bullish',
          entryDatetime: z.entryDatetime || entry.entryDatetime || null,
          exitDatetime: z.exitDatetime || entry.exitDatetime || null,
          holdingDurationMinutes: z.holdingDurationMinutes ?? null,
          holdingBars: z.holdingBars ?? null,
          minRr: z.minRr,
          maxRr: z.maxRr,
          slPoints: z.slPoints ?? z.minSlPoints,
          realSlPoints: z.realSlPoints,
          minSlPoints: z.slPoints ?? z.minSlPoints,
          maxSlPoints: z.realSlPoints ?? z.maxSlPoints,
          isMissed: Boolean(z.isMissed),
          isNoZone: Boolean(z.isNoZone),
          invalidationReason: z.invalidationReason || null,
          outcome: (z.outcome as any) || '',
          notes: z.notes || ''
        }))
      } else {
        zones.value = zoneColumns.value.map((col) => ({
          customColumnId: col.id,
          customColumnName: col.name,
          zoneInstanceName: null,
          bias: 'Bullish',
          entryDatetime: entry.entryDatetime || null,
          exitDatetime: null,
          holdingDurationMinutes: null,
          holdingBars: null,
          minRr: null,
          maxRr: null,
          slPoints: null,
          realSlPoints: null,
          minSlPoints: null,
          maxSlPoints: null,
          isMissed: false,
          isNoZone: false,
          invalidationReason: null,
          outcome: '',
          notes: ''
        }))
      }

      // Load customData for field columns
      const loadedCustomData = (entry.customData as Record<string | number, any>) || {}
      const newCustomData: Record<string | number, any> = { ...loadedCustomData }
      for (const col of fieldColumns.value) {
        if (newCustomData[col.id] === undefined) {
          if (col.type === 'checkbox') {
            newCustomData[col.id] = false
          } else if (col.type === 'multiple_selector') {
            newCustomData[col.id] = []
          } else {
            newCustomData[col.id] = null
          }
        }
      }
      customData.value = newCustomData

      return { success: true, data: entry }
    } catch (err: any) {
      submitError.value = err.message
      return { success: false, error: err.message }
    } finally {
      isSubmitting.value = false
    }
  }

  // Cancel edit mode
  const cancelEdit = () => {
    editingEntryId.value = null
    resetForm()
  }

  // Reset form to defaults
  const resetForm = () => {
    editingEntryId.value = null
    const now = getNowLocalDatetime()
    entryDatetime.value = now
    exitDatetime.value = now
    notes.value = ''
    news.value = false
    quality.value = 'A'
    images.value = []

    if (zoneColumns.value.length > 0) {
      zones.value = zoneColumns.value.map((col) => ({
        customColumnId: col.id,
        customColumnName: col.name,
        zoneInstanceName: null,
        bias: 'Bullish',
        entryDatetime: now,
        exitDatetime: now,
        holdingDurationMinutes: 0,
        holdingBars: null,
        minRr: null,
        maxRr: null,
        slPoints: null,
        realSlPoints: null,
        minSlPoints: null,
        maxSlPoints: null,
        isMissed: false,
        isNoZone: false,
        invalidationReason: null,
        outcome: '',
        notes: ''
      }))
    } else {
      zones.value = []
    }

    const newCustomData: Record<string | number, any> = {}
    for (const col of fieldColumns.value) {
      if (col.type === 'checkbox') {
        newCustomData[col.id] = false
      } else if (col.type === 'multiple_selector') {
        newCustomData[col.id] = []
      } else {
        newCustomData[col.id] = null
      }
    }
    customData.value = newCustomData
    recalculateSession()
  }

  // Submit trade entry (creates or updates based on editingEntryId)
  const submitEntry = async () => {
    if (!isValid.value || !setupId.value || !symbolId.value) {
      submitError.value = 'กรุณากรอกข้อมูลที่จำเป็น (Setup, Symbol, วันเวลาเข้า)'
      return { success: false, error: submitError.value }
    }

    isSubmitting.value = true
    submitError.value = null

    try {
      const payload: ResearchEntryInput = {
        setupId: setupId.value,
        symbolId: symbolId.value,
        entryDatetime: entryDatetime.value,
        exitDatetime: enableExitDate.value ? exitDatetime.value : null,
        sessionName: sessionName.value,
        timeframe: timeframe.value,
        news: news.value,
        quality: quality.value,
        images: images.value,
        notes: notes.value,
        customData: customData.value,
        zones: zones.value.map((z) => ({
          customColumnId: z.customColumnId,
          zoneInstanceName: z.zoneInstanceName || null,
          bias: z.bias,
          entryDatetime: z.entryDatetime || null,
          exitDatetime: z.exitDatetime || null,
          holdingDurationMinutes: z.holdingDurationMinutes ?? null,
          holdingBars: z.holdingBars ?? null,
          minRr: z.isMissed || z.isNoZone ? null : z.minRr,
          maxRr: z.isMissed || z.isNoZone ? null : z.maxRr,
          slPoints: z.slPoints,
          realSlPoints: z.isMissed || z.isNoZone ? null : z.realSlPoints,
          minSlPoints: z.slPoints ?? z.minSlPoints,
          maxSlPoints: z.realSlPoints ?? z.maxSlPoints,
          isMissed: Boolean(z.isMissed),
          isNoZone: Boolean(z.isNoZone),
          invalidationReason: z.invalidationReason || null,
          outcome: z.isNoZone
            ? 'no_zone'
            : z.isMissed
            ? 'missed'
            : z.minRr === -1 || z.maxRr === -1
            ? 'loss'
            : z.minRr === 0
            ? 'be'
            : z.minRr && z.minRr > 0
            ? 'win'
            : (z.outcome as any) || undefined,
          notes: z.notes
        }))
      }

      if (editingEntryId.value) {
        const res = await window.api.research.entries.update(
          editingEntryId.value,
          JSON.parse(JSON.stringify(payload))
        )
        if (res.success) {
          return { success: true, isUpdate: true, data: res.data }
        } else {
          submitError.value = res.error || 'Failed to update research entry'
          return { success: false, error: submitError.value }
        }
      } else {
        const res = await window.api.research.entries.create(JSON.parse(JSON.stringify(payload)))
        if (res.success) {
          resetForm()
          return { success: true, isUpdate: false, data: res.data }
        } else {
          submitError.value = res.error || 'Failed to save research entry'
          return { success: false, error: submitError.value }
        }
      }
    } catch (err: any) {
      submitError.value = err.message
      return { success: false, error: err.message }
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    setups,
    symbols,
    activeSetupSessions,
    activeLinkedColumns,
    zoneColumns,
    fieldColumns,
    customData,
    enableExitDate,
    editingEntryId,
    isEditMode,
    setupId,
    symbolId,
    entryDatetime,
    exitDatetime,
    sessionName,
    timeframe,
    news,
    quality,
    notes,
    images,
    zones,
    isValid,
    isSubmitting,
    submitError,
    initialize,
    onSelectSetup,
    recalculateSession,
    onEntryDatetimeChange,
    onExitDatetimeChange,
    onZoneEntryDatetimeChange,
    onZoneExitDatetimeChange,
    onBiasChange,
    onSlPointsChange,
    onRealSlPointsChange,
    onMinSlPointsChange,
    onMaxSlPointsChange,
    duplicateZone,
    removeDuplicatedZone,
    toggleZoneNoZone,
    setZoneInvalidationReason,
    onZoneTimeChange,
    setZoneLoss,
    setZoneBe,
    setZoneMissed,
    setZoneQuickRr,
    uploadImageFile,
    addImageUrl,
    removeImage,
    resetForm,
    cancelEdit,
    loadEntryForEdit,
    submitEntry
  }
})
