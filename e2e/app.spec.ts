import { _electron as electron } from 'playwright'
import { test, expect, ElectronApplication } from '@playwright/test'

let electronApp: ElectronApplication

test.beforeAll(async () => {
  electronApp = await electron.launch({ args: ['.'] })
})

test.afterAll(async () => {
  await electronApp.close()
})

test('app opens and shows main window', async () => {
  const window = await electronApp.firstWindow()
  const title = await window.title()

  // Wait for Vue to mount
  await window.waitForSelector('#app', { state: 'attached' })

  // Take a screenshot for the PDF report later
  await window.screenshot({ path: 'e2e/screenshots/main-window.png' })

  // Basic validation that the app loaded without white screen of death
  expect(await window.locator('#app').count()).toBe(1)
})
