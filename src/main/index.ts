import { app, shell, BrowserWindow, ipcMain, protocol, net } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initUpdater, checkForUpdates, setUpdaterWindow } from './services/updater'
import { registerUpdaterHandlers } from './ipc/updaterHandlers'
import icon from '../../resources/icon.png?asset'
import { runMigrations } from './db/client'
import { registerSetupHandlers } from './ipc/setupHandlers'
import { registerImageHandlers } from './ipc/imageHandlers'
import { registerBackupHandlers } from './ipc/backupHandlers'
import { registerJournalHandlers } from './ipc/journalHandlers'
import { registerSymbolHandlers } from './ipc/symbolHandlers'
import { registerCustomColumnHandlers } from './ipc/customColumnHandlers'
import { registerSetupSessionHandlers } from './ipc/setupSessionHandlers'
import { autoBackup } from './services/backup'
import { getPaths } from './paths'

function createWindow(): BrowserWindow {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Run auto backup once a day when the app starts
  await autoBackup()

  // Register custom protocol for images
  protocol.handle('app-img', (request) => {
    const url = request.url.replace('app-img://', '')
    const { dataDir } = getPaths()

    try {
      const decodedUrl = decodeURIComponent(url)
      const filePath = join(dataDir, decodedUrl)

      // Prevent path traversal
      if (!filePath.startsWith(dataDir)) {
        return new Response('Access denied', { status: 403 })
      }

      return net.fetch('file://' + filePath)
    } catch (err) {
      return new Response('File not found', { status: 404 })
    }
  })

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.tradingjournal.v2')

  // Run database migrations
  runMigrations()

  // Register IPC Handlers
  registerSetupHandlers()
  registerImageHandlers()
  registerBackupHandlers()
  registerJournalHandlers()
  registerSymbolHandlers()
  registerCustomColumnHandlers()
  registerSetupSessionHandlers()
  registerUpdaterHandlers()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  const win = createWindow()
  initUpdater(win)

  // Check for updates shortly after launch in production
  if (!is.dev) {
    setTimeout(() => {
      checkForUpdates().catch((err) => console.error('Background update check failed:', err))
    }, 5000)
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      const newWin = createWindow()
      setUpdaterWindow(newWin)
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
