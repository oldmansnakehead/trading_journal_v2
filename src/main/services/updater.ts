import { app, BrowserWindow } from 'electron'
import { autoUpdater, UpdateInfo } from 'electron-updater'
import { is } from '@electron-toolkit/utils'

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error'

export interface UpdateProgress {
  percent: number
  bytesPerSecond: number
  transferred: number
  total: number
}

export interface UpdateInfoData {
  version: string
  releaseName?: string
  releaseNotes?: string | Array<{ version: string; note: string | null }>
  releaseDate?: string
}

export interface UpdaterState {
  status: UpdateStatus
  currentVersion: string
  updateInfo?: UpdateInfoData | null
  progress?: UpdateProgress | null
  error?: string | null
}

let mainWindow: BrowserWindow | null = null

const state: UpdaterState = {
  status: 'idle',
  currentVersion: app.getVersion(),
  updateInfo: null,
  progress: null,
  error: null
}

function broadcastState(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('updater:status-changed', { ...state })
  }
}

export function setUpdaterWindow(window: BrowserWindow | null): void {
  mainWindow = window
}

export function getUpdaterState(): UpdaterState {
  return {
    ...state,
    currentVersion: app.getVersion()
  }
}

export function initUpdater(window?: BrowserWindow): void {
  if (window) {
    mainWindow = window
  }

  // Configure autoUpdater settings
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  // Remove existing listeners to prevent duplicates if re-initialized
  autoUpdater.removeAllListeners()

  autoUpdater.on('checking-for-update', () => {
    state.status = 'checking'
    state.error = null
    broadcastState()
  })

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    state.status = 'available'
    state.updateInfo = {
      version: info.version,
      releaseName: info.releaseName || undefined,
      releaseNotes: info.releaseNotes || undefined,
      releaseDate: info.releaseDate || undefined
    }
    state.error = null
    broadcastState()
  })

  autoUpdater.on('update-not-available', (info: UpdateInfo) => {
    state.status = 'not-available'
    state.updateInfo = {
      version: info.version,
      releaseName: info.releaseName || undefined,
      releaseNotes: info.releaseNotes || undefined,
      releaseDate: info.releaseDate || undefined
    }
    state.error = null
    broadcastState()
  })

  autoUpdater.on('download-progress', (progressObj) => {
    state.status = 'downloading'
    state.progress = {
      percent: Math.round(progressObj.percent * 10) / 10,
      bytesPerSecond: progressObj.bytesPerSecond,
      transferred: progressObj.transferred,
      total: progressObj.total
    }
    state.error = null
    broadcastState()
  })

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    state.status = 'downloaded'
    state.updateInfo = {
      version: info.version,
      releaseName: info.releaseName || undefined,
      releaseNotes: info.releaseNotes || undefined,
      releaseDate: info.releaseDate || undefined
    }
    state.error = null
    broadcastState()
  })

  autoUpdater.on('error', (err: Error) => {
    state.status = 'error'
    state.error = err ? err.message || String(err) : 'Unknown error during update'
    broadcastState()
  })
}

export async function checkForUpdates(): Promise<UpdaterState> {
  state.error = null
  state.status = 'checking'
  broadcastState()

  try {
    if (is.dev) {
      // In development environment, electron-updater requires dev-app-update.yml
      // Provide a clean simulation/fallback if not configured
      try {
        await autoUpdater.checkForUpdates()
      } catch (devErr: any) {
        // Fallback for dev mode when dev-app-update.yml is not present
        state.status = 'not-available'
        state.updateInfo = {
          version: app.getVersion(),
          releaseName: 'Development Build',
          releaseNotes: 'Dev mode: Auto-updates require a packaged application or dev-app-update.yml.'
        }
        broadcastState()
        return getUpdaterState()
      }
    } else {
      await autoUpdater.checkForUpdates()
    }
  } catch (err: any) {
    state.status = 'error'
    state.error = err ? err.message || String(err) : 'Failed to check for updates'
    broadcastState()
  }

  return getUpdaterState()
}

export async function downloadUpdate(): Promise<UpdaterState> {
  if (state.status !== 'available') {
    return getUpdaterState()
  }

  state.status = 'downloading'
  state.progress = {
    percent: 0,
    bytesPerSecond: 0,
    transferred: 0,
    total: 0
  }
  broadcastState()

  try {
    await autoUpdater.downloadUpdate()
  } catch (err: any) {
    state.status = 'error'
    state.error = err ? err.message || String(err) : 'Failed to download update'
    broadcastState()
  }

  return getUpdaterState()
}

export function quitAndInstall(): void {
  if (state.status === 'downloaded') {
    // isSilent: false, isForceRunAfter: true
    autoUpdater.quitAndInstall(false, true)
  }
}
