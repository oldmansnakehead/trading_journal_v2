import { _electron as electron } from 'playwright'
import { test, expect, ElectronApplication, Page } from '@playwright/test'

let electronApp: ElectronApplication
let window: Page

test.beforeAll(async () => {
  electronApp = await electron.launch({ args: ['.'] })
  window = await electronApp.firstWindow()
})

test.afterAll(async () => {
  await electronApp.close()
})

test('fill trade and save', async () => {
  await window.waitForSelector('#app', { state: 'attached' })
  
  await window.click('text=Settings')
  
  await window.click('button:has-text("Setups")')
  await window.click('text=Add Setup')
  await window.fill('input[placeholder="e.g. SMC Classic"]', 'SMC Test')
  await window.click('button:has-text("Save Setup")')
  await window.waitForTimeout(500)

  await window.click('button:has-text("Symbols")')
  await window.click('text=Add Symbol')
  await window.fill('input[placeholder="e.g. EURUSD, BTCUSDT"]', 'BTCUSDT')
  await window.click('button:has-text("Save Symbol")')
  await window.waitForTimeout(500)

  await window.click('text=New Trade')
  await window.waitForSelector('text=New Journal Entry')

  const dtInputs = window.locator('input[type="datetime-local"]')
  await dtInputs.first().fill('2026-10-10T10:00')

  const selects = window.locator('select')
  await selects.nth(0).selectOption({ index: 1 })
  await selects.nth(1).selectOption({ index: 1 })
  
  const slInputs = window.locator('input[type="number"]')
  await slInputs.first().fill('10') 
  
  await window.click('button:has-text("Save Entry")')

  await window.waitForSelector('text=Entry saved successfully!', { timeout: 5000 })
  
  await window.screenshot({ path: 'scratch/toast-success.png' })
})
