import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface JournalFormData {
  setupId: number | ''
  symbolId: number | ''
  position: 'Buy' | 'Sell'
  directionBias: 'Bullish' | 'Bearish'
  entryTimeframe: string
  sessionName: string
  entryDatetime: string
  exitDatetime: string
  quality: 'Green' | 'Blue' | 'Yellow' | 'Orange' | 'Red'
  news: boolean
  isTest: boolean
  notes: string

  normalRr: number | null
  normalMaxRr: number | null
  normalSlPoints: number | null

  beRr: number | null
  beMaxRr: number | null
  beSlPoints: number | null

  trailRr: number | null
  trailMaxRr: number | null
  trailSlPoints: number | null
}

export interface TradeTab {
  id: string
  title: string
  form: JournalFormData
  imageUrls: string[]
  customColumns: any[]
  customData: Record<string, any>
  setupSessions: any[]
  isSaving: boolean
  isSaved: boolean
}

export const createDefaultForm = (): JournalFormData => ({
  setupId: '',
  symbolId: '',
  position: 'Buy',
  directionBias: 'Bullish',
  entryTimeframe: 'M15',
  sessionName: 'New York',
  entryDatetime: '',
  exitDatetime: '',
  quality: 'Green',
  news: false,
  isTest: false,
  notes: '',

  normalRr: null,
  normalMaxRr: null,
  normalSlPoints: null,

  beRr: null,
  beMaxRr: null,
  beSlPoints: null,

  trailRr: null,
  trailMaxRr: null,
  trailSlPoints: null
})

let tabSequence = 1

export const createNewTradeTab = (initial?: Partial<TradeTab>): TradeTab => {
  const id = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  return {
    id,
    title: initial?.title || `Trade #${tabSequence++}`,
    form: initial?.form ? JSON.parse(JSON.stringify(initial.form)) : createDefaultForm(),
    imageUrls: initial?.imageUrls ? [...initial.imageUrls] : [''],
    customColumns: initial?.customColumns ? JSON.parse(JSON.stringify(initial.customColumns)) : [],
    customData: initial?.customData ? JSON.parse(JSON.stringify(initial.customData)) : {},
    setupSessions: initial?.setupSessions ? JSON.parse(JSON.stringify(initial.setupSessions)) : [],
    isSaving: false,
    isSaved: false
  }
}

export const useTradeTabsStore = defineStore('tradeTabs', () => {
  const tabs = ref<TradeTab[]>([createNewTradeTab()])
  const activeTabId = ref<string>(tabs.value[0].id)

  const setups = ref<{ id: number; name: string }[]>([])
  const symbols = ref<{ id: number; name: string }[]>([])
  const isLoadingMetadata = ref(false)

  const activeTab = computed(() => {
    return tabs.value.find((t) => t.id === activeTabId.value) || tabs.value[0]
  })

  const activeTabIndex = computed(() => {
    return tabs.value.findIndex((t) => t.id === activeTabId.value)
  })

  const getTabDisplayTitle = (tab: TradeTab, index: number): string => {
    const setup = setups.value.find((s) => s.id === tab.form.setupId)
    const symbol = symbols.value.find((s) => s.id === tab.form.symbolId)

    if (symbol && setup) {
      return `${symbol.name} • ${setup.name}`
    } else if (symbol) {
      return `${symbol.name} (#${index + 1})`
    } else if (setup) {
      return `${setup.name} (#${index + 1})`
    }
    return tab.title || `Trade #${index + 1}`
  }

  const hasTabData = (tab: TradeTab): boolean => {
    const f = tab.form
    return (
      f.setupId !== '' ||
      f.symbolId !== '' ||
      f.entryDatetime !== '' ||
      f.notes.trim() !== '' ||
      f.normalRr !== null ||
      f.beRr !== null ||
      f.trailRr !== null ||
      tab.imageUrls.some((u) => u.trim().length > 0)
    )
  }

  const addTab = (): string => {
    const newTab = createNewTradeTab()
    tabs.value.push(newTab)
    activeTabId.value = newTab.id
    return newTab.id
  }

  const duplicateTab = (tabId: string): string => {
    const sourceTab = tabs.value.find((t) => t.id === tabId)
    if (!sourceTab) return addTab()

    const cloned = createNewTradeTab({
      title: `${sourceTab.title} (Copy)`,
      form: sourceTab.form,
      imageUrls: sourceTab.imageUrls,
      customColumns: sourceTab.customColumns,
      customData: sourceTab.customData,
      setupSessions: sourceTab.setupSessions
    })

    const sourceIndex = tabs.value.findIndex((t) => t.id === tabId)
    if (sourceIndex >= 0) {
      tabs.value.splice(sourceIndex + 1, 0, cloned)
    } else {
      tabs.value.push(cloned)
    }

    activeTabId.value = cloned.id
    return cloned.id
  }

  const closeTab = (tabId: string): void => {
    const index = tabs.value.findIndex((t) => t.id === tabId)
    if (index === -1) return

    if (tabs.value.length === 1) {
      // If closing the only tab, reset it rather than leaving empty
      resetTab(tabId)
      return
    }

    if (activeTabId.value === tabId) {
      const nextTab = tabs.value[index + 1] || tabs.value[index - 1]
      if (nextTab) {
        activeTabId.value = nextTab.id
      }
    }

    tabs.value.splice(index, 1)
  }

  const setActiveTab = (tabId: string): void => {
    const exists = tabs.value.some((t) => t.id === tabId)
    if (exists) {
      activeTabId.value = tabId
    }
  }

  const resetTab = (tabId: string): void => {
    const tab = tabs.value.find((t) => t.id === tabId)
    if (!tab) return

    tab.form = createDefaultForm()
    tab.imageUrls = ['']
    tab.customColumns = []
    tab.customData = {}
    tab.setupSessions = []
    tab.isSaving = false
    tab.isSaved = false
  }

  const loadMetadata = async (): Promise<void> => {
    if (isLoadingMetadata.value) return
    isLoadingMetadata.value = true
    try {
      if (typeof window !== 'undefined' && window.api) {
        const [setupsRes, symbolsRes] = await Promise.all([
          window.api.setups.list(),
          window.api.symbols.list()
        ])
        if (setupsRes?.success) setups.value = setupsRes.data || []
        if (symbolsRes?.success) symbols.value = symbolsRes.data || []
      }
    } catch (err) {
      console.error('Failed to load metadata in tradeTabs store:', err)
    } finally {
      isLoadingMetadata.value = false
    }
  }

  const onSetupChange = async (tabId: string, setupId: number | ''): Promise<void> => {
    const tab = tabs.value.find((t) => t.id === tabId)
    if (!tab) return

    if (!setupId) {
      tab.customColumns = []
      tab.customData = {}
      tab.setupSessions = []
      return
    }

    try {
      if (typeof window !== 'undefined' && window.api) {
        const res = await window.api.setups.getDetails(setupId)
        if (res?.success && res.data) {
          tab.customColumns = res.data.customColumns || []
          tab.setupSessions = res.data.sessions || []

          const newData: Record<string, any> = {}
          if (res.data.customColumns) {
            res.data.customColumns.forEach((col: any) => {
              if (col.type === 'switch' || col.type === 'checkbox') newData[col.id] = false
              else if (col.type === 'number') newData[col.id] = null
              else if (col.type === 'multiple_selector') newData[col.id] = []
              else newData[col.id] = ''
            })
          }
          tab.customData = newData
          tab.form.sessionName = ''
        }
      }
    } catch (e) {
      console.error('Failed to load custom columns for setup:', e)
    }
  }

  const onEntryDatetimeChange = (tabId: string, newVal: string): void => {
    const tab = tabs.value.find((t) => t.id === tabId)
    if (!tab || !newVal) return

    tab.form.exitDatetime = newVal

    if (tab.setupSessions && tab.setupSessions.length > 0) {
      const timePart = newVal.includes('T') ? newVal.split('T')[1] : newVal.split(' ')[1]
      if (timePart) {
        const [hours, mins] = timePart.split(':').map(Number)
        const currentMins = hours * 60 + mins

        let foundSession = ''
        for (const s of tab.setupSessions) {
          if (!s.startTime || !s.endTime) continue
          const [sHours, sMins] = s.startTime.split(':').map(Number)
          const [eHours, eMins] = s.endTime.split(':').map(Number)
          const startMins = sHours * 60 + sMins
          const endMins = eHours * 60 + eMins

          if (startMins <= endMins) {
            if (currentMins >= startMins && currentMins <= endMins) {
              foundSession = s.sessionName
              break
            }
          } else {
            if (currentMins >= startMins || currentMins <= endMins) {
              foundSession = s.sessionName
              break
            }
          }
        }
        if (foundSession) {
          tab.form.sessionName = foundSession
        }
      }
    }
  }

  const validateTab = (tab: TradeTab): { valid: boolean; error?: string } => {
    if (!tab.form.entryDatetime) {
      return { valid: false, error: 'Entry Date & Time is required' }
    }
    if (!tab.form.setupId) {
      return { valid: false, error: 'Trading Setup is required' }
    }
    if (!tab.form.symbolId) {
      return { valid: false, error: 'Symbol is required' }
    }

    const hasRR =
      (tab.form.normalRr !== null && (tab.form.normalRr as any) !== '') ||
      (tab.form.beRr !== null && (tab.form.beRr as any) !== '') ||
      (tab.form.trailRr !== null && (tab.form.trailRr as any) !== '')
    if (!hasRR) {
      return { valid: false, error: 'At least one RR value is required (Normal, BE, or Trail)' }
    }

    return { valid: true }
  }

  const saveTab = async (tabId: string): Promise<{ success: boolean; error?: string }> => {
    const tab = tabs.value.find((t) => t.id === tabId)
    if (!tab) return { success: false, error: 'Tab not found' }
    if (tab.isSaving) return { success: false, error: 'Already saving' }

    const validation = validateTab(tab)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    tab.isSaving = true

    try {
      const validImages = tab.imageUrls.filter((url) => url.trim().length > 0)

      const entryData = {
        ...tab.form,
        setupId: Number(tab.form.setupId),
        symbolId: Number(tab.form.symbolId),
        exitDatetime: tab.form.exitDatetime || null,
        sessionName: tab.form.sessionName || null,

        normalTpPoints:
          tab.form.normalRr && tab.form.normalSlPoints
            ? Number((tab.form.normalRr * tab.form.normalSlPoints).toFixed(2))
            : null,
        beTpPoints:
          tab.form.beRr && tab.form.beSlPoints
            ? Number((tab.form.beRr * tab.form.beSlPoints).toFixed(2))
            : null,
        trailTpPoints:
          tab.form.trailRr && tab.form.trailSlPoints
            ? Number((tab.form.trailRr * tab.form.trailSlPoints).toFixed(2))
            : null,

        images: validImages.length > 0 ? validImages : null,
        customData: Object.keys(tab.customData).length > 0 ? tab.customData : null
      }

      const plainEntryData = JSON.parse(JSON.stringify(entryData))
      const res = await window.api.journal.create(plainEntryData)

      if (res?.success) {
        tab.isSaved = true
        return { success: true }
      } else {
        return { success: false, error: res?.error || 'Failed to save trade entry' }
      }
    } catch (err: any) {
      return { success: false, error: err.message || String(err) }
    } finally {
      tab.isSaving = false
    }
  }

  const saveAllTabs = async (): Promise<{
    total: number
    succeeded: number
    failed: number
    errors: string[]
  }> => {
    const candidateTabs = tabs.value.filter((t) => hasTabData(t) && !t.isSaved)
    if (candidateTabs.length === 0) {
      return { total: 0, succeeded: 0, failed: 0, errors: ['No unsaved tabs with trade data'] }
    }

    let succeeded = 0
    let failed = 0
    const errors: string[] = []

    for (let i = 0; i < candidateTabs.length; i++) {
      const tab = candidateTabs[i]
      const tabTitle = getTabDisplayTitle(tab, i)
      const res = await saveTab(tab.id)
      if (res.success) {
        succeeded++
      } else {
        failed++
        errors.push(`[${tabTitle}]: ${res.error}`)
      }
    }

    return {
      total: candidateTabs.length,
      succeeded,
      failed,
      errors
    }
  }

  return {
    tabs,
    activeTabId,
    activeTab,
    activeTabIndex,
    setups,
    symbols,
    isLoadingMetadata,
    getTabDisplayTitle,
    hasTabData,
    addTab,
    duplicateTab,
    closeTab,
    setActiveTab,
    resetTab,
    loadMetadata,
    onSetupChange,
    onEntryDatetimeChange,
    validateTab,
    saveTab,
    saveAllTabs
  }
})
