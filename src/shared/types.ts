export interface IpcResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface Setup {
  id: number
  name: string
  description: string
  type: string
  created_at: string
  updated_at: string
}

export interface SetupPlaybookFlow {
  id?: number
  setupId: number
  flowData: {
    nodes: any[]
    edges: any[]
    viewport?: { x: number; y: number; zoom: number }
  }
  createdAt?: string
  updatedAt?: string
}
