import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import { ipcRenderer } from 'electron'

const safeClone = <T>(obj: T): T => {
  if (obj === undefined || obj === null) return obj
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch {
    return obj
  }
}

const api = {
  setups: {
    list: () => ipcRenderer.invoke('setups:list'),
    getDetails: (id: number) => ipcRenderer.invoke('setups:getDetails', id),
    create: (data: any) => ipcRenderer.invoke('setups:create', safeClone(data)),
    delete: (id: number) => ipcRenderer.invoke('setups:delete', id)
  },
  symbols: {
    list: () => ipcRenderer.invoke('symbols:list'),
    create: (data: { name: string }) => ipcRenderer.invoke('symbols:create', safeClone(data)),
    delete: (id: number) => ipcRenderer.invoke('symbols:delete', id)
  },
  images: {
    save: (buffer: ArrayBuffer, name: string) => ipcRenderer.invoke('images:save', { buffer, name }),
    export: (dataUrl: string, defaultName?: string) =>
      ipcRenderer.invoke('images:export', { dataUrl, defaultName }),
    copyToClipboard: (dataUrl: string) =>
      ipcRenderer.invoke('images:copyToClipboard', { dataUrl })
  },
  backup: {
    export: () => ipcRenderer.invoke('backup:export'),
    import: () => ipcRenderer.invoke('backup:import'),
    clear: () => ipcRenderer.invoke('backup:clear')
  },
  journal: {
    list: () => ipcRenderer.invoke('journal:list'),
    get: (id: number) => ipcRenderer.invoke('journal:get', id),
    kpi: (mode: string) => ipcRenderer.invoke('journal:kpi', mode),
    create: (data: any) => ipcRenderer.invoke('journal:create', safeClone(data)),
    delete: (id: number) => ipcRenderer.invoke('journal:delete', id),
    deleteMany: (ids: number[]) => ipcRenderer.invoke('journal:deleteMany', safeClone(ids)),
    exportExcel: (data: {
      trades: any[]
      kpis?: any
      statMode?: string
      filters?: any
      defaultName?: string
    }) => ipcRenderer.invoke('journal:exportExcel', safeClone(data)),
    exportAi: (data: {
      trades: any[]
      kpis?: any
      statMode?: string
      filters?: any
      format?: 'md' | 'json'
      defaultName?: string
    }) => ipcRenderer.invoke('journal:exportAi', safeClone(data)),
    generateAiReport: (data: {
      trades: any[]
      kpis?: any
      statMode?: string
      filters?: any
      format?: 'md' | 'json'
    }) => ipcRenderer.invoke('journal:generateAiReport', safeClone(data))
  },
  customColumns: {
    list: (setupId?: number | null) => ipcRenderer.invoke('customColumns:list', setupId),
    listLibrary: () => ipcRenderer.invoke('customColumns:listLibrary'),
    create: (data: any) => ipcRenderer.invoke('customColumns:create', safeClone(data)),
    update: (id: number, data: any) => ipcRenderer.invoke('customColumns:update', id, safeClone(data)),
    delete: (id: number) => ipcRenderer.invoke('customColumns:delete', id),
    linkSetup: (data: { setupId: number; customColumnId: number; isRequired?: boolean; orderIndex?: number }) =>
      ipcRenderer.invoke('customColumns:linkSetup', safeClone(data)),
    unlinkSetup: (data: { setupId: number; customColumnId: number }) =>
      ipcRenderer.invoke('customColumns:unlinkSetup', safeClone(data)),
    batchSyncSetup: (data: { setupId: number; columnIds: number[] }) =>
      ipcRenderer.invoke('customColumns:batchSyncSetup', safeClone(data))
  },
  setupSessions: {
    create: (data: any) => ipcRenderer.invoke('setupSessions:create', safeClone(data)),
    delete: (id: number) => ipcRenderer.invoke('setupSessions:delete', id)
  },
  setupPlaybooks: {
    save: (data: { setupId: number, content: string }) => ipcRenderer.invoke('setupPlaybooks:save', safeClone(data))
  },
  setupPlaybookFlows: {
    get: (setupId: number) => ipcRenderer.invoke('setupPlaybookFlows:get', setupId),
    save: (data: { setupId: number, flowData: any }) => ipcRenderer.invoke('setupPlaybookFlows:save', safeClone(data))
  },
  research: {
    setups: {
      list: () => ipcRenderer.invoke('researchSetups:list'),
      get: (id: number) => ipcRenderer.invoke('researchSetups:get', id),
      getDetails: (id: number) => ipcRenderer.invoke('researchSetups:getDetails', id),
      create: (data: any) => ipcRenderer.invoke('researchSetups:create', safeClone(data)),
      update: (id: number, data: any) => ipcRenderer.invoke('researchSetups:update', id, safeClone(data)),
      delete: (id: number) => ipcRenderer.invoke('researchSetups:delete', id)
    },
    sessions: {
      listBySetup: (setupId: number) => ipcRenderer.invoke('researchSessions:listBySetup', setupId),
      create: (data: any) => ipcRenderer.invoke('researchSessions:create', safeClone(data)),
      delete: (id: number) => ipcRenderer.invoke('researchSessions:delete', id)
    },
    playbooks: {
      get: (setupId: number) => ipcRenderer.invoke('researchPlaybooks:get', setupId),
      save: (data: { setupId: number; content: string }) => ipcRenderer.invoke('researchPlaybooks:save', safeClone(data))
    },
    playbookFlows: {
      get: (setupId: number) => ipcRenderer.invoke('researchPlaybookFlows:get', setupId),
      save: (data: { setupId: number; flowData: any }) => ipcRenderer.invoke('researchPlaybookFlows:save', safeClone(data))
    },
    customColumns: {
      list: (setupId?: number | null) => ipcRenderer.invoke('researchCustomColumns:list', setupId),
      listLibrary: () => ipcRenderer.invoke('researchCustomColumns:listLibrary'),
      create: (data: any) => ipcRenderer.invoke('researchCustomColumns:create', safeClone(data)),
      update: (id: number, data: any) => ipcRenderer.invoke('researchCustomColumns:update', id, safeClone(data)),
      delete: (id: number) => ipcRenderer.invoke('researchCustomColumns:delete', id),
      linkSetup: (data: { setupId: number; customColumnId: number; orderIndex?: number }) =>
        ipcRenderer.invoke('researchCustomColumns:linkSetup', safeClone(data)),
      unlinkSetup: (data: { setupId: number; customColumnId: number }) =>
        ipcRenderer.invoke('researchCustomColumns:unlinkSetup', safeClone(data)),
      batchSyncSetup: (data: { setupId: number; columnIds: number[] }) =>
        ipcRenderer.invoke('researchCustomColumns:batchSyncSetup', safeClone(data))
    },
    entries: {
      list: (filters?: any) => ipcRenderer.invoke('researchEntries:list', safeClone(filters)),
      get: (id: number) => ipcRenderer.invoke('researchEntries:get', id),
      create: (data: any) => ipcRenderer.invoke('researchEntries:create', safeClone(data)),
      update: (id: number, data: any) => ipcRenderer.invoke('researchEntries:update', id, safeClone(data)),
      delete: (id: number) => ipcRenderer.invoke('researchEntries:delete', id),
      deleteMany: (ids: number[]) => ipcRenderer.invoke('researchEntries:deleteMany', safeClone(ids)),
      getAnalytics: (filters?: any) => ipcRenderer.invoke('researchEntries:getAnalytics', safeClone(filters))
    },
    export: {
      ai: (payload: any) => ipcRenderer.invoke('research:exportAi', safeClone(payload)),
      generateAiReport: (payload: any) => ipcRenderer.invoke('research:generateAiReport', safeClone(payload)),
      excel: (payload: any) => ipcRenderer.invoke('research:exportExcel', safeClone(payload))
    }
  },
  updater: {
    check: () => ipcRenderer.invoke('updater:check'),
    download: () => ipcRenderer.invoke('updater:download'),
    install: () => ipcRenderer.invoke('updater:install'),
    getStatus: () => ipcRenderer.invoke('updater:getStatus'),
    getVersion: () => ipcRenderer.invoke('updater:getVersion'),
    onStatusChange: (callback: (state: any) => void) => {
      const listener = (_event: any, state: any): void => callback(state)
      ipcRenderer.on('updater:status-changed', listener)
      return (): void => {
        ipcRenderer.removeListener('updater:status-changed', listener)
      }
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
