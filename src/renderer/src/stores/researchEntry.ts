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
  customColumnId: number
  customColumnName: string
  bias: 'Bullish' | 'Bearish' | ''
  minRr: number | null
  maxRr: number | null
  slPoints: number | null
  realSlPoints: number | null
  minSlPoints?: number | null
  maxSlPoints?: number | null
  isMissed: boolean
  outcome: 'win' | 'loss' | 'be' | 'missed' | ''
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
          bias: 'Bullish',
          minRr: null,
          maxRr: null,
          slPoints: null,
          realSlPoints: null,
          minSlPoints: null,
          maxSlPoints: null,
          isMissed: false,
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

  // Handle entry datetime change: auto-detects session and auto-copies value to exit datetime
  const onEntryDatetimeChange = () => {
    recalculateSession()
    if (entryDatetime.value) {
      exitDatetime.value = entryDatetime.value
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

  // Quick action: Loss = -1 (Rule 4.7)
  const setZoneLoss = (index: number) => {
    const z = zones.value[index]
    if (!z) return
    z.isMissed = false
    z.minRr = -1
    z.maxRr = -1
    z.realSlPoints = null // Clear real SL on loss (leave blank)
    z.maxSlPoints = null
    z.outcome = 'loss'
  }

  // Quick action: Break-Even = 0
  const setZoneBe = (index: number) => {
    const z = zones.value[index]
    if (!z) return
    z.isMissed = false
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
      z.minRr = null
      z.maxRr = null
      z.realSlPoints = null
      z.maxSlPoints = null
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

      // Map existing zones for zone columns only
      const existingZoneMap = new Map<number, any>()
      if (entry.zones) {
        for (const z of entry.zones) {
          existingZoneMap.set(z.customColumnId, z)
        }
      }

      zones.value = zoneColumns.value.map((col) => {
        const found = existingZoneMap.get(col.id)
        if (found) {
          return {
            customColumnId: col.id,
            customColumnName: col.name,
            bias: (found.bias as any) || 'Bullish',
            minRr: found.minRr,
            maxRr: found.maxRr,
            slPoints: found.slPoints ?? found.minSlPoints,
            realSlPoints: found.realSlPoints,
            minSlPoints: found.slPoints ?? found.minSlPoints,
            maxSlPoints: found.realSlPoints ?? found.maxSlPoints,
            isMissed: Boolean(found.isMissed),
            outcome: (found.outcome as any) || '',
            notes: found.notes || ''
          }
        }
        return {
          customColumnId: col.id,
          customColumnName: col.name,
          bias: 'Bullish',
          minRr: null,
          maxRr: null,
          slPoints: null,
          realSlPoints: null,
          minSlPoints: null,
          maxSlPoints: null,
          isMissed: false,
          outcome: '',
          notes: ''
        }
      })

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
        bias: 'Bullish',
        minRr: null,
        maxRr: null,
        slPoints: null,
        realSlPoints: null,
        minSlPoints: null,
        maxSlPoints: null,
        isMissed: false,
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
          bias: z.bias,
          minRr: z.isMissed ? null : z.minRr,
          maxRr: z.isMissed ? null : z.maxRr,
          slPoints: z.slPoints,
          realSlPoints: z.isMissed ? null : z.realSlPoints,
          minSlPoints: z.slPoints ?? z.minSlPoints,
          maxSlPoints: z.realSlPoints ?? z.maxSlPoints,
          isMissed: z.isMissed,
          outcome: z.isMissed
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
    onBiasChange,
    onSlPointsChange,
    onRealSlPointsChange,
    onMinSlPointsChange,
    onMaxSlPointsChange,
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
