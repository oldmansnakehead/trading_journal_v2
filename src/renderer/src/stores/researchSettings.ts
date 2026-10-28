import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  ResearchSetup,
  ResearchSession,
  ResearchCustomColumn
} from '../../../shared/types'

const toPlain = <T>(obj: T): T => {
  if (obj === undefined || obj === null) return obj
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch {
    return obj
  }
}

export const useResearchSettingsStore = defineStore('researchSettings', () => {
  const setups = ref<ResearchSetup[]>([])
  const symbols = ref<Array<{ id: number; name: string }>>([])
  const libraryCustomColumns = ref<any[]>([])
  const selectedSetupId = ref<number | null>(null)

  const activeSetupDetails = ref<{
    sessions: ResearchSession[]
    playbookContent: string
    playbookFlowData: any | null
    linkedCustomColumns: ResearchCustomColumn[]
  }>({
    sessions: [],
    playbookContent: '',
    playbookFlowData: null,
    linkedCustomColumns: []
  })

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const selectedSetup = computed(() => {
    if (!selectedSetupId.value) return null
    return setups.value.find((s) => s.id === selectedSetupId.value) || null
  })

  // Load all research setups
  const fetchSetups = async () => {
    isLoading.value = true
    error.value = null
    try {
      const res = await window.api.research.setups.list()
      if (res.success && res.data) {
        setups.value = res.data
        if (setups.value.length > 0 && !selectedSetupId.value) {
          await selectSetup(setups.value[0].id)
        }
      } else {
        error.value = res.error || 'Failed to load research setups'
      }
    } catch (err: any) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // Load shared symbols
  const fetchSymbols = async () => {
    try {
      const res = await window.api.symbols.list()
      if (res.success && res.data) {
        symbols.value = res.data
      }
    } catch (err: any) {
      console.error('Failed to load symbols:', err)
    }
  }

  // Add shared symbol
  const addSymbol = async (name: string) => {
    try {
      const res = await window.api.symbols.create({ name: name.toUpperCase().trim() })
      if (res.success) {
        await fetchSymbols()
        return { success: true }
      }
      return { success: false, error: res.error }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // Delete shared symbol
  const deleteSymbol = async (id: number) => {
    try {
      const res = await window.api.symbols.delete(id)
      if (res.success) {
        await fetchSymbols()
        return { success: true }
      }
      return { success: false, error: res.error }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // Load custom columns library
  const fetchCustomColumnsLibrary = async () => {
    try {
      const res = await window.api.research.customColumns.listLibrary()
      if (res.success && res.data) {
        libraryCustomColumns.value = res.data
      }
    } catch (err: any) {
      console.error('Failed to load custom columns library:', err)
    }
  }

  // Select a setup and load its details
  const selectSetup = async (setupId: number) => {
    selectedSetupId.value = setupId
    try {
      const res = await window.api.research.setups.getDetails(setupId)
      if (res.success && res.data) {
        activeSetupDetails.value = {
          sessions: res.data.sessions || [],
          playbookContent: res.data.playbooks?.[0]?.content || '',
          playbookFlowData: res.data.flows?.[0]?.flowData || null,
          linkedCustomColumns: res.data.customColumns || []
        }
      }
    } catch (err: any) {
      console.error('Failed to load setup details:', err)
    }
  }

  // Create research setup
  const createSetup = async (data: {
    name: string
    description?: string
    type: string
    enableExitDate?: boolean
  }) => {
    try {
      const res = await window.api.research.setups.create(toPlain(data))
      if (res.success && res.data) {
        await fetchSetups()
        await selectSetup(res.data.id)
        return { success: true, data: res.data }
      }
      return { success: false, error: res.error }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // Update research setup
  const updateSetup = async (
    id: number,
    data: {
      name?: string
      description?: string
      type?: string
      enableExitDate?: boolean
    }
  ) => {
    try {
      const res = await window.api.research.setups.update(id, toPlain(data))
      if (res.success && res.data) {
        await fetchSetups()
        if (selectedSetupId.value === id) {
          await selectSetup(id)
        }
        return { success: true, data: res.data }
      }
      return { success: false, error: res.error }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // Delete research setup
  const deleteSetup = async (id: number) => {
    try {
      const res = await window.api.research.setups.delete(id)
      if (res.success) {
        if (selectedSetupId.value === id) {
          selectedSetupId.value = null
        }
        await fetchSetups()
        return { success: true }
      }
      return { success: false, error: res.error }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // Add session to current setup
  const addSession = async (session: {
    startTime: string
    endTime: string
    sessionName: string
  }) => {
    if (!selectedSetupId.value) return { success: false, error: 'No setup selected' }
    try {
      const res = await window.api.research.sessions.create(toPlain({
        setupId: selectedSetupId.value,
        ...session
      }))
      if (res.success) {
        await selectSetup(selectedSetupId.value)
        return { success: true }
      }
      return { success: false, error: res.error }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // Delete session
  const deleteSession = async (id: number) => {
    try {
      const res = await window.api.research.sessions.delete(id)
      if (res.success && selectedSetupId.value) {
        await selectSetup(selectedSetupId.value)
        return { success: true }
      }
      return { success: false, error: res.error }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // Save playbook text
  const savePlaybookContent = async (content: string) => {
    if (!selectedSetupId.value) return { success: false, error: 'No setup selected' }
    try {
      const res = await window.api.research.playbooks.save({
        setupId: selectedSetupId.value,
        content
      })
      if (res.success) {
        activeSetupDetails.value.playbookContent = content
        return { success: true }
      }
      return { success: false, error: res.error }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // Save playbook flow
  const savePlaybookFlow = async (flowData: any) => {
    if (!selectedSetupId.value) return { success: false, error: 'No setup selected' }
    try {
      const res = await window.api.research.playbookFlows.save(toPlain({
        setupId: selectedSetupId.value,
        flowData
      }))
      if (res.success) {
        activeSetupDetails.value.playbookFlowData = flowData
        return { success: true }
      }
      return { success: false, error: res.error }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // Custom Columns Master Library Operations
  const createMasterColumn = async (data: {
    name: string
    type: string
    options?: string[]
    description?: string
  }) => {
    try {
      const res = await window.api.research.customColumns.create(toPlain(data))
      if (res.success && res.data) {
        await fetchCustomColumnsLibrary()
        return { success: true, data: res.data }
      }
      return { success: false, error: res.error }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  const updateMasterColumn = async (
    id: number,
    data: {
      name?: string
      type?: string
      options?: string[]
      description?: string
    }
  ) => {
    try {
      const res = await window.api.research.customColumns.update(id, toPlain(data))
      if (res.success) {
        await fetchCustomColumnsLibrary()
        if (selectedSetupId.value) {
          await selectSetup(selectedSetupId.value)
        }
        return { success: true }
      }
      return { success: false, error: res.error }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  const deleteMasterColumn = async (id: number) => {
    try {
      const res = await window.api.research.customColumns.delete(id)
      if (res.success) {
        await fetchCustomColumnsLibrary()
        if (selectedSetupId.value) {
          await selectSetup(selectedSetupId.value)
        }
        return { success: true }
      }
      return { success: false, error: res.error }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // Link/Unlink custom columns with current setup
  const linkColumnToSetup = async (customColumnId: number, orderIndex?: number) => {
    if (!selectedSetupId.value) return { success: false, error: 'No setup selected' }
    try {
      const res = await window.api.research.customColumns.linkSetup(toPlain({
        setupId: selectedSetupId.value,
        customColumnId,
        orderIndex: orderIndex ?? 0
      }))
      if (res.success) {
        await selectSetup(selectedSetupId.value)
        await fetchCustomColumnsLibrary()
        return { success: true }
      }
      return { success: false, error: res.error }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  const unlinkColumnFromSetup = async (customColumnId: number) => {
    if (!selectedSetupId.value) return { success: false, error: 'No setup selected' }
    try {
      const res = await window.api.research.customColumns.unlinkSetup(toPlain({
        setupId: selectedSetupId.value,
        customColumnId
      }))
      if (res.success) {
        await selectSetup(selectedSetupId.value)
        await fetchCustomColumnsLibrary()
        return { success: true }
      }
      return { success: false, error: res.error }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  const batchSyncSetupColumns = async (columnIds: number[]) => {
    if (!selectedSetupId.value) return { success: false, error: 'No setup selected' }
    try {
      const res = await window.api.research.customColumns.batchSyncSetup(toPlain({
        setupId: selectedSetupId.value,
        columnIds
      }))
      if (res.success) {
        await selectSetup(selectedSetupId.value)
        await fetchCustomColumnsLibrary()
        return { success: true }
      }
      return { success: false, error: res.error }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  return {
    setups,
    symbols,
    libraryCustomColumns,
    selectedSetupId,
    selectedSetup,
    activeSetupDetails,
    isLoading,
    error,
    fetchSetups,
    fetchSymbols,
    addSymbol,
    deleteSymbol,
    fetchCustomColumnsLibrary,
    selectSetup,
    createSetup,
    updateSetup,
    deleteSetup,
    addSession,
    deleteSession,
    savePlaybookContent,
    savePlaybookFlow,
    createMasterColumn,
    updateMasterColumn,
    deleteMasterColumn,
    linkColumnToSetup,
    unlinkColumnFromSetup,
    batchSyncSetupColumns
  }
})
