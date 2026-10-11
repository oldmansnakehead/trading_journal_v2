import { ipcMain, dialog, BrowserWindow, clipboard, nativeImage } from 'electron'
import { promises as fs } from 'fs'
import { saveImage } from '../services/images'

export const registerImageHandlers = () => {
  ipcMain.handle(
    'images:save',
    async (_, { buffer, name }: { buffer: ArrayBuffer; name: string }) => {
      try {
        const imgBuffer = Buffer.from(buffer)
        const path = await saveImage(imgBuffer, name)
        return { success: true, data: path }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )

  ipcMain.handle(
    'images:export',
    async (event, { dataUrl, defaultName }: { dataUrl: string; defaultName?: string }) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) return { success: false, error: 'No window found' }

      const dateStr = new Date().toISOString().split('T')[0]
      const defaultPath = defaultName || `Trading_Dashboard_${dateStr}.png`

      const { canceled, filePath } = await dialog.showSaveDialog(window, {
        title: 'Save Dashboard Image',
        defaultPath,
        filters: [{ name: 'PNG Images', extensions: ['png'] }]
      })

      if (canceled || !filePath) {
        return { success: false, canceled: true }
      }

      try {
        const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')
        await fs.writeFile(filePath, buffer)
        return { success: true, filePath }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )

  ipcMain.handle(
    'images:copyToClipboard',
    async (_, { dataUrl }: { dataUrl: string }) => {
      try {
        const image = nativeImage.createFromDataURL(dataUrl)
        clipboard.writeImage(image)
        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )
}

