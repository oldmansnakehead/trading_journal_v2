import { _electron as electron } from 'playwright'
import { test, expect, ElectronApplication, Page } from '@playwright/test'

let electronApp: ElectronApplication
let window: Page

test.beforeAll(async () => {
  electronApp = await electron.launch({ args: ['.'] })
  window = await electronApp.firstWindow()
})

test.afterAll(async () => {
  if (electronApp) {
    await electronApp.close()
  }
})

test('fill trade and save', async () => {
  const uniqueId = Date.now().toString().slice(-4)
  const setupName = `SMC Test ${uniqueId}`
  const symbolName = `SYM${uniqueId}`

  await test.step('Wait for application ready at 900px default width', async () => {
    await window.waitForSelector('#app', { state: 'attached' })
    expect(await window.locator('#app').count()).toBe(1)
  })

  await test.step('Navigate to Settings via sidebar UI', async () => {
    await window.click('text=Settings')
    await expect(window.locator('h1:has-text("Settings")')).toBeVisible({ timeout: 5000 })
  })

  await test.step('Create a new Trading Setup', async () => {
    await window.click('button:has-text("Trading Setups")')
    await window.click('button:has-text("Add Setup")')
    await window.fill('input[placeholder="e.g. SMC Classic"]', setupName)
    await window.click('button:has-text("Save Setup")')

    // Verify setup is visible in UI list
    await expect(window.locator(`h3:has-text("${setupName}")`)).toBeVisible({ timeout: 5000 })
    await window.screenshot({ path: 'e2e/screenshots/setup-created.png' })
  })

  await test.step('Create a new Trading Symbol', async () => {
    await window.click('button:has-text("Symbols")')
    await window.fill('#new-symbol input, input[placeholder="Enter new symbol..."]', symbolName)
    await window.click('button:has-text("Add Symbol")')

    // Verify symbol tag appears in UI
    await expect(window.locator(`text=${symbolName}`)).toBeVisible({ timeout: 5000 })
    await window.screenshot({ path: 'e2e/screenshots/symbol-created.png' })
  })

  await test.step('Navigate to New Trade via sidebar UI', async () => {
    await window.click('text=New Trade')
    await expect(window.locator('h1:has-text("New Journal Entry")')).toBeVisible({ timeout: 5000 })
  })

  await test.step('Fill trade details with created Setup, Symbol, Date, and RR values', async () => {
    // Select Setup
    await window.click('[data-testid="setup-select"]')
    await window.locator('.absolute.z-50').locator(`text=${setupName}`).click()

    // Select Symbol
    await window.click('[data-testid="symbol-select"]')
    await window.locator('.absolute.z-50').locator(`text=${symbolName}`).click()

    // Select Entry Date & Time using date picker
    await window.click('[data-testid="entry-date-picker"]')
    await window.locator('.grid.grid-cols-7 button:not([disabled])').first().click()
    // Close picker by clicking overlay if present
    if (await window.locator('.fixed.inset-0.z-40').isVisible()) {
      await window.click('.fixed.inset-0.z-40')
    }

    // Fill SL Points and RR
    await window.fill('[data-testid="normal-sl-points"]', '10')
    await window.fill('[data-testid="normal-rr"]', '2.5')

    await window.screenshot({ path: 'e2e/screenshots/trade-entry-filled.png' })
  })

  await test.step('Save trade entry and verify success notification', async () => {
    await window.click('button:has-text("Save Entry")')
    await expect(window.locator('text=Entry saved successfully!')).toBeVisible({ timeout: 5000 })

    await window.screenshot({ path: 'e2e/screenshots/toast-success.png' })
  })

  await test.step('Verify saved trade data in Dashboard UI', async () => {
    await window.click('text=Dashboard')
    await expect(window.locator('h1:has-text("Reports & Dashboard")')).toBeVisible({ timeout: 5000 })

    // Verify newly recorded trade appears in the table with its Symbol and Setup
    await expect(window.locator(`td:has-text("${symbolName}")`).first()).toBeVisible({ timeout: 5000 })
    await expect(window.locator(`td:has-text("${setupName}")`).first()).toBeVisible({ timeout: 5000 })

    // Verify pagination controls are visible on Recent Trades table
    await expect(window.locator('[data-testid="base-pagination"]')).toBeVisible({ timeout: 5000 })
    await expect(window.locator('[data-testid="pagination-page-size-select"]')).toBeVisible({ timeout: 5000 })

    // Verify Export Excel button is visible and active on Dashboard
    await expect(window.locator('.export-excel-btn').first()).toBeVisible({ timeout: 5000 })

    await window.screenshot({ path: 'e2e/screenshots/dashboard-verified.png' })
  })
})
