import { _electron as electron } from 'playwright'
import { test, expect, ElectronApplication } from '@playwright/test'

let electronApp: ElectronApplication

test.beforeAll(async () => {
  electronApp = await electron.launch({ args: ['.'] })
})

test.afterAll(async () => {
  if (electronApp) {
    await electronApp.close()
  }
})

test('app opens and shows main window', async () => {
  const window = await test.step('Launch Electron app and get main window', async () => {
    return await electronApp.firstWindow()
  })

  await test.step('Wait for application root to mount', async () => {
    await window.waitForSelector('#app', { state: 'attached' })
    expect(await window.locator('#app').count()).toBe(1)
  })

  await test.step('Verify navigation elements are accessible at default width 900px', async () => {
    await expect(window.locator('aside').locator('text=Trading Journal')).toBeVisible()
    await expect(window.locator('aside').locator('text=Dashboard')).toBeVisible()
    await expect(window.locator('aside').locator('text=Settings')).toBeVisible()
    await expect(window.locator('aside').locator('text=New Trade')).toBeVisible()
  })

  await test.step('Verify responsive navigation when window is narrowed', async () => {
    await window.setViewportSize({ width: 600, height: 700 })
    await expect(window.locator('[data-testid="mobile-menu-btn"]')).toBeVisible()
    // Open mobile menu drawer
    await window.click('[data-testid="mobile-menu-btn"]')
    await expect(window.locator('[data-testid="mobile-drawer"]')).toBeVisible()
    await expect(window.locator('[data-testid="mobile-drawer"]').locator('text=Settings')).toBeVisible()
    await expect(window.locator('[data-testid="mobile-drawer"]').locator('text=New Trade')).toBeVisible()
    // Close mobile menu drawer
    await window.click('[data-testid="close-menu-btn"]')
    await expect(window.locator('[data-testid="mobile-drawer"]')).not.toBeVisible()
    // Reset to default 900px
    await window.setViewportSize({ width: 900, height: 670 })
  })

  await test.step('Capture main window screenshot', async () => {
    await window.screenshot({ path: 'e2e/screenshots/main-window.png' })
  })
})
