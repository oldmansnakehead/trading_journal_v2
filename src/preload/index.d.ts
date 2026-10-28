import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  ResearchSetup,
  ResearchSession,
  ResearchPlaybook,
  ResearchCustomColumn,
  ResearchEntry,
  ResearchEntryInput,
  ResearchFilters,
  ResearchAnalyticsSummary,
  ResearchExportPayload
} from '../shared/types'

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
        list: (setupId?: number | null) => Promise<any>
        listLibrary: () => Promise<any>
        create: (data: any) => Promise<any>
        update: (id: number, data: any) => Promise<any>
        delete: (id: number) => Promise<any>
        linkSetup: (data: { setupId: number; customColumnId: number; isRequired?: boolean; orderIndex?: number }) => Promise<any>
        unlinkSetup: (data: { setupId: number; customColumnId: number }) => Promise<any>
        batchSyncSetup: (data: { setupId: number; columnIds: number[] }) => Promise<any>
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
      research: {
        setups: {
          list: () => Promise<{ success: boolean; data?: ResearchSetup[]; error?: string }>
          get: (id: number) => Promise<{ success: boolean; data?: ResearchSetup; error?: string }>
          getDetails: (id: number) => Promise<{ success: boolean; data?: any; error?: string }>
          create: (data: {
            name: string
            description?: string
            type: string
            enableExitDate?: boolean
          }) => Promise<{ success: boolean; data?: ResearchSetup; error?: string }>
          update: (
            id: number,
            data: {
              name?: string
              description?: string
              type?: string
              enableExitDate?: boolean
            }
          ) => Promise<{ success: boolean; data?: ResearchSetup; error?: string }>
          delete: (id: number) => Promise<{ success: boolean; error?: string }>
        }
        sessions: {
          listBySetup: (
            setupId: number
          ) => Promise<{ success: boolean; data?: ResearchSession[]; error?: string }>
          create: (data: {
            setupId: number
            startTime: string
            endTime: string
            sessionName: string
          }) => Promise<{ success: boolean; data?: ResearchSession; error?: string }>
          delete: (id: number) => Promise<{ success: boolean; error?: string }>
        }
        playbooks: {
          get: (
            setupId: number
          ) => Promise<{ success: boolean; data?: ResearchPlaybook | null; error?: string }>
          save: (data: {
            setupId: number
            content: string
          }) => Promise<{ success: boolean; data?: ResearchPlaybook; error?: string }>
        }
        playbookFlows: {
          get: (setupId: number) => Promise<{ success: boolean; data?: any; error?: string }>
          save: (data: {
            setupId: number
            flowData: any
          }) => Promise<{ success: boolean; data?: any; error?: string }>
        }
        customColumns: {
          list: (
            setupId?: number | null
          ) => Promise<{ success: boolean; data?: ResearchCustomColumn[]; error?: string }>
          listLibrary: () => Promise<{ success: boolean; data?: any[]; error?: string }>
          create: (data: {
            name: string
            type: string
            options?: string[]
            description?: string
          }) => Promise<{ success: boolean; data?: ResearchCustomColumn; error?: string }>
          update: (
            id: number,
            data: {
              name?: string
              type?: string
              options?: string[]
              description?: string
            }
          ) => Promise<{ success: boolean; data?: ResearchCustomColumn; error?: string }>
          delete: (id: number) => Promise<{ success: boolean; error?: string }>
          linkSetup: (data: {
            setupId: number
            customColumnId: number
            orderIndex?: number
          }) => Promise<{ success: boolean; data?: any; error?: string }>
          unlinkSetup: (data: {
            setupId: number
            customColumnId: number
          }) => Promise<{ success: boolean; error?: string }>
          batchSyncSetup: (data: {
            setupId: number
            columnIds: number[]
          }) => Promise<{ success: boolean; error?: string }>
        }
        entries: {
          list: (
            filters?: ResearchFilters
          ) => Promise<{ success: boolean; data?: ResearchEntry[]; error?: string }>
          get: (id: number) => Promise<{ success: boolean; data?: ResearchEntry; error?: string }>
          create: (
            data: ResearchEntryInput
          ) => Promise<{ success: boolean; data?: any; error?: string }>
          update: (
            id: number,
            data: Partial<ResearchEntryInput>
          ) => Promise<{ success: boolean; data?: any; error?: string }>
          delete: (id: number) => Promise<{ success: boolean; error?: string }>
          deleteMany: (ids: number[]) => Promise<{ success: boolean; error?: string }>
          getAnalytics: (
            filters?: ResearchFilters
          ) => Promise<{ success: boolean; data?: ResearchAnalyticsSummary; error?: string }>
        }
        export: {
          ai: (
            payload: ResearchExportPayload
          ) => Promise<{ success: boolean; canceled?: boolean; filePath?: string; format?: 'md' | 'json'; error?: string }>
          generateAiReport: (
            payload: ResearchExportPayload & { format?: 'md' | 'json' }
          ) => Promise<{ success: boolean; content?: string; format?: 'md' | 'json'; error?: string }>
          excel: (
            payload: { entries: any[]; analytics?: any; setupName?: string; defaultName?: string }
          ) => Promise<{ success: boolean; canceled?: boolean; filePath?: string; error?: string }>
        }
      }
      updater: {
        check: () => Promise<{
          status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
          currentVersion: string
          updateInfo?: {
            version: string
            releaseName?: string
            releaseNotes?: string | Array<{ version: string; note: string | null }>
            releaseDate?: string
          } | null
          progress?: {
            percent: number
            bytesPerSecond: number
            transferred: number
            total: number
          } | null
          error?: string | null
        }>
        download: () => Promise<any>
        install: () => Promise<{ success: boolean }>
        getStatus: () => Promise<{
          status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
          currentVersion: string
          updateInfo?: {
            version: string
            releaseName?: string
            releaseNotes?: string | Array<{ version: string; note: string | null }>
            releaseDate?: string
          } | null
          progress?: {
            percent: number
            bytesPerSecond: number
            transferred: number
            total: number
          } | null
          error?: string | null
        }>
        getVersion: () => Promise<string>
        onStatusChange: (callback: (state: any) => void) => () => void
      }
    }
  }
}
