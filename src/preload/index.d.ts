import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      setups: {
        list: () => Promise<any>
        get: (id: number) => Promise<any>
        getDetails: (id: number) => Promise<any>
        create: (data: any) => Promise<any>
        delete: (id: number) => Promise<any>
      }
      symbols: {
        list: () => Promise<any>
        get: (id: number) => Promise<any>
        create: (data: { name: string }) => Promise<any>
        delete: (id: number) => Promise<any>
      }
      images: {
        save: (buffer: ArrayBuffer, name: string) => Promise<any>
      }
      backup: {
        export: () => Promise<any>
        import: () => Promise<any>
        clear: () => Promise<any>
      }
      journal: {
        list: () => Promise<any>
        get: (id: number) => Promise<any>
        kpi: (mode: string) => Promise<any>
        create: (data: any) => Promise<any>
        delete: (id: number) => Promise<any>
        deleteMany: (ids: number[]) => Promise<any>
      }
      customColumns: {
        list: (setupId: number) => Promise<any>
        create: (data: any) => Promise<any>
        update: (id: number, data: any) => Promise<any>
        delete: (id: number) => Promise<any>
      }
      setupSessions: {
        create: (data: any) => Promise<any>
        delete: (id: number) => Promise<any>
      }
      setupPlaybooks: {
        save: (data: { setupId: number, content: string }) => Promise<any>
      }
    }
  }
}
