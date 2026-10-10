import { ipcMain } from 'electron'
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
}
