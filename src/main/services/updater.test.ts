import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockListeners, mockAutoUpdater } = vi.hoisted(() => {
  const mockListeners: Record<string, ((...args: any[]) => void)[]> = {}
  const mockAutoUpdater = {
    autoDownload: false,
    autoInstallOnAppQuit: true,
    removeAllListeners: vi.fn(() => {
      for (const key in mockListeners) {
        delete mockListeners[key]
      }
    }),
    on: vi.fn((event: string, callback: (...args: any[]) => void) => {
      if (!mockListeners[event]) {
        mockListeners[event] = []
      }
      mockListeners[event].push(callback)
      return mockAutoUpdater
    }),
    checkForUpdates: vi.fn().mockResolvedValue({}),
    downloadUpdate: vi.fn().mockResolvedValue([]),
    quitAndInstall: vi.fn()
  }
  return { mockListeners, mockAutoUpdater }
})

vi.mock('electron', () => ({
  app: {
    getVersion: vi.fn(() => '1.0.0')
  },
  BrowserWindow: vi.fn()
}))

vi.mock('electron-updater', () => ({
  autoUpdater: mockAutoUpdater
}))

vi.mock('@electron-toolkit/utils', () => ({
  is: { dev: false }
}))

import {
  initUpdater,
  getUpdaterState,
  checkForUpdates,
  downloadUpdate,
  quitAndInstall,
  setUpdaterWindow
} from './updater'

describe('Updater Service', () => {
  const mockWindow = {
    isDestroyed: vi.fn(() => false),
    webContents: {
      send: vi.fn()
    }
  } as any

  beforeEach(() => {
    vi.clearAllMocks()
    initUpdater(mockWindow)
    setUpdaterWindow(mockWindow)
  })

  it('initializes with default idle state and current version', () => {
    const state = getUpdaterState()
    expect(state.currentVersion).toBe('1.0.0')
    expect(mockAutoUpdater.autoDownload).toBe(false)
    expect(mockAutoUpdater.autoInstallOnAppQuit).toBe(true)
  })

  it('updates state and notifies on checking-for-update', () => {
    const checkingListener = mockListeners['checking-for-update']?.[0]
    expect(checkingListener).toBeDefined()
    checkingListener()

    const state = getUpdaterState()
    expect(state.status).toBe('checking')
    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      'updater:status-changed',
      expect.objectContaining({ status: 'checking' })
    )
  })

  it('updates state and stores updateInfo on update-available', () => {
    const availableListener = mockListeners['update-available']?.[0]
    expect(availableListener).toBeDefined()
    availableListener({
      version: '1.1.0',
      releaseName: 'v1.1.0 Feature Release',
      releaseNotes: 'Fixed bugs and added auto-updater',
      releaseDate: '2026-10-15T18:00:00Z'
    })

    const state = getUpdaterState()
    expect(state.status).toBe('available')
    expect(state.updateInfo?.version).toBe('1.1.0')
    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      'updater:status-changed',
      expect.objectContaining({
        status: 'available',
        updateInfo: expect.objectContaining({ version: '1.1.0' })
      })
    )
  })

  it('updates state on update-not-available', () => {
    const notAvailableListener = mockListeners['update-not-available']?.[0]
    expect(notAvailableListener).toBeDefined()
    notAvailableListener({ version: '1.0.0' })

    const state = getUpdaterState()
    expect(state.status).toBe('not-available')
  })

  it('tracks progress on download-progress', () => {
    const progressListener = mockListeners['download-progress']?.[0]
    expect(progressListener).toBeDefined()
    progressListener({
      percent: 45.67,
      bytesPerSecond: 1048576,
      transferred: 4500000,
      total: 10000000
    })

    const state = getUpdaterState()
    expect(state.status).toBe('downloading')
    expect(state.progress?.percent).toBe(45.7)
  })

  it('updates state on update-downloaded', () => {
    const downloadedListener = mockListeners['update-downloaded']?.[0]
    expect(downloadedListener).toBeDefined()
    downloadedListener({
      version: '1.1.0'
    })

    const state = getUpdaterState()
    expect(state.status).toBe('downloaded')
  })

  it('triggers quitAndInstall when downloaded', () => {
    const downloadedListener = mockListeners['update-downloaded']?.[0]
    downloadedListener({ version: '1.1.0' })

    quitAndInstall()
    expect(mockAutoUpdater.quitAndInstall).toHaveBeenCalledWith(false, true)
  })

  it('handles error event properly', () => {
    const errorListener = mockListeners['error']?.[0]
    expect(errorListener).toBeDefined()
    errorListener(new Error('Network connection timed out'))

    const state = getUpdaterState()
    expect(state.status).toBe('error')
    expect(state.error).toContain('Network connection timed out')
  })

  it('downloadUpdate triggers autoUpdater.downloadUpdate when update is available', async () => {
    const availableListener = mockListeners['update-available']?.[0]
    availableListener({ version: '1.1.0' })

    await downloadUpdate()
    expect(mockAutoUpdater.downloadUpdate).toHaveBeenCalled()
  })

  it('checkForUpdates calls autoUpdater.checkForUpdates in production mode', async () => {
    await checkForUpdates()
    expect(mockAutoUpdater.checkForUpdates).toHaveBeenCalled()
  })
})
