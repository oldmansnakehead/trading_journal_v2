import { ipcMain, dialog, BrowserWindow } from 'electron'
import { exportBackup, importBackup, clearDatabase } from '../services/backup'

export const registerBackupHandlers = () => {
  ipcMain.handle('backup:export', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return { success: false, error: 'No window found' }

    // Let user pick where to save the zip
    const dateStr = new Date().toISOString().split('T')[0]
    const { canceled, filePath } = await dialog.showSaveDialog(window, {
      title: 'Export Data Backup',
      defaultPath: `TradingJournalBackup_${dateStr}.zip`,
      filters: [{ name: 'Zip Archives', extensions: ['zip'] }]
    })

    if (canceled || !filePath) return { success: false, error: 'User canceled' }

    const result = await exportBackup(filePath)
    return { ...result, filePath }
  })

  ipcMain.handle('backup:import', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return { success: false, error: 'No window found' }

    // Open native file picker to select backup file
    const { canceled, filePaths } = await dialog.showOpenDialog(window, {
      title: 'Select Backup File (.zip)',
      filters: [{ name: 'Zip Archives', extensions: ['zip'] }],
      properties: ['openFile']
    })

    if (canceled || filePaths.length === 0) return { success: false, error: 'User canceled' }

    const result = await importBackup(filePaths[0])
    return result
  })

  ipcMain.handle('backup:clear', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return { success: false, error: 'No window found' }

    const result = await clearDatabase()
    return result
  })
}
