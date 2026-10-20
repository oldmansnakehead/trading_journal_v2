import { ipcMain, app } from 'electron'
import {
  checkForUpdates,
  downloadUpdate,
  quitAndInstall,
  getUpdaterState
} from '../services/updater'

export const registerUpdaterHandlers = (): void => {
  ipcMain.handle('updater:check', async () => {
    return await checkForUpdates()
  })

  ipcMain.handle('updater:download', async () => {
    return await downloadUpdate()
  })

  ipcMain.handle('updater:install', async () => {
    quitAndInstall()
    return { success: true }
  })

  ipcMain.handle('updater:getStatus', async () => {
    return getUpdaterState()
  })

  ipcMain.handle('updater:getVersion', async () => {
    return app.getVersion()
  })
}
