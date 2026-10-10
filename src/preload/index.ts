import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import { ipcRenderer } from 'electron'

const api = {
  setups: {
    list: () => ipcRenderer.invoke('setups:list'),
    getDetails: (id: number) => ipcRenderer.invoke('setups:getDetails', id),
    create: (data: any) => ipcRenderer.invoke('setups:create', data),
    delete: (id: number) => ipcRenderer.invoke('setups:delete', id)
  },
  symbols: {
    list: () => ipcRenderer.invoke('symbols:list'),
    create: (data: { name: string }) => ipcRenderer.invoke('symbols:create', data),
    delete: (id: number) => ipcRenderer.invoke('symbols:delete', id)
  },
  images: {
    save: (buffer: ArrayBuffer, name: string) => ipcRenderer.invoke('images:save', { buffer, name })
  },
  backup: {
    export: () => ipcRenderer.invoke('backup:export'),
    import: () => ipcRenderer.invoke('backup:import')
  },
  journal: {
    list: () => ipcRenderer.invoke('journal:list'),
    kpi: (mode: string) => ipcRenderer.invoke('journal:kpi', mode),
    create: (data: any) => ipcRenderer.invoke('journal:create', data)
  },
  customColumns: {
    list: (setupId: number) => ipcRenderer.invoke('customColumns:list', setupId),
    create: (data: any) => ipcRenderer.invoke('customColumns:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('customColumns:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('customColumns:delete', id)
  },
  setupSessions: {
    create: (data: any) => ipcRenderer.invoke('setupSessions:create', data),
    delete: (id: number) => ipcRenderer.invoke('setupSessions:delete', id)
  },
  setupPlaybooks: {
    save: (data: { setupId: number, content: string }) => ipcRenderer.invoke('setupPlaybooks:save', data)
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
