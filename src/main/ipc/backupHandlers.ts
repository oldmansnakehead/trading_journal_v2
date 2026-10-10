import { ipcMain, dialog, BrowserWindow } from 'electron'
import { exportBackup, importBackup } from '../services/backup'

export const registerBackupHandlers = () => {
  ipcMain.handle('backup:export', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return { success: false, error: 'No window found' }

    // Let user pick where to save the zip
    const { canceled, filePath } = await dialog.showSaveDialog(window, {
      title: 'Export Data Backup',
      defaultPath: `TradingJournalBackup_${new Date().toISOString().split('T')[0]}.zip`,
      filters: [{ name: 'Zip Archives', extensions: ['zip'] }]
    })

    if (canceled || !filePath) return { success: false, error: 'User canceled' }

    return await exportBackup(filePath)
  })

  ipcMain.handle('backup:import', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return { success: false, error: 'No window found' }

    // Warn the user before importing
    const { response } = await dialog.showMessageBox(window, {
      type: 'warning',
      title: 'Import Backup',
      message:
        'This will overwrite your current data. A safe backup of your current state will be saved in the app data folder. Do you wish to continue?',
      buttons: ['Cancel', 'Yes, Import']
    })

    if (response !== 1) return { success: false, error: 'User canceled' }

    // Let user pick the zip file
    const { canceled, filePaths } = await dialog.showOpenDialog(window, {
      title: 'Select Backup File',
      filters: [{ name: 'Zip Archives', extensions: ['zip'] }],
      properties: ['openFile']
    })

    if (canceled || filePaths.length === 0) return { success: false, error: 'User canceled' }

    const result = await importBackup(filePaths[0])

    if (result.success) {
      // Optional: Ask user to restart the app to reload the DB properly
      await dialog.showMessageBox(window, {
        type: 'info',
        title: 'Import Successful',
        message:
          'Your backup has been imported successfully. Please restart the app to apply the changes.',
        buttons: ['OK']
      })
    }

    return result
  })
}
