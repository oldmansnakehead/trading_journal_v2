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
        export: (
          dataUrl: string,
          defaultName?: string
        ) => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>
        copyToClipboard: (dataUrl: string) => Promise<{ success: boolean; error?: string }>
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
        exportExcel: (data: {
          trades: any[]
          kpis?: any
          statMode?: string
          filters?: any
          defaultName?: string
        }) => Promise<{
          success: boolean
          canceled?: boolean
          format?: 'xlsx' | 'csv'
          filePath?: string
          error?: string
        }>
        exportAi: (data: {
          trades: any[]
          kpis?: any
          statMode?: string
          filters?: any
          format?: 'md' | 'json'
          defaultName?: string
        }) => Promise<{
          success: boolean
          canceled?: boolean
          format?: 'md' | 'json'
          filePath?: string
          error?: string
        }>
        generateAiReport: (data: {
          trades: any[]
          kpis?: any
          statMode?: string
          filters?: any
          format?: 'md' | 'json'
        }) => Promise<{
          success: boolean
          content?: string
          format?: 'md' | 'json'
          error?: string
        }>
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
      setupPlaybookFlows: {
        get: (setupId: number) => Promise<any>
        save: (data: { setupId: number, flowData: any }) => Promise<any>
      }
    }
  }
}
