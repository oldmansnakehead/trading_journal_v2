import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import { ipcRenderer } from 'electron'

const api = {
  setups: {
    list: () => ipcRenderer.invoke('setups:list'),
    create: (data: any) => ipcRenderer.invoke('setups:create', data),
    delete: (id: number) => ipcRenderer.invoke('setups:delete', id)
  },
  images: {
    save: (buffer: ArrayBuffer, name: string) => ipcRenderer.invoke('images:save', { buffer, name })
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
