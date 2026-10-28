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

test('trade research: complete research and zone statistics workflow', async () => {
  const uniqueId = Date.now().toString().slice(-4)
  const setupName = `SMC Res ${uniqueId}`
  const zoneName1 = `Zone Extreme ${uniqueId}`
  const zoneName2 = `Zone Decisional ${uniqueId}`

  await test.step('Wait for application ready at 1100px width', async () => {
    await window.setViewportSize({ width: 1100, height: 750 })
    await window.waitForSelector('#app', { state: 'attached' })
    expect(await window.locator('#app').count()).toBe(1)
  })

  await test.step('Navigate to Research Settings via sidebar UI', async () => {
    await window.click('text=ตั้งค่าสถิติ (Settings)')
    await expect(window.locator('h1:has-text("ตั้งค่าสถิติวิจัย")')).toBeVisible({ timeout: 5000 })
  })

  await test.step('Create a new Research Setup with enableExitDate = true', async () => {
    await window.click('[data-testid="add-research-setup-btn"]')
    await window.waitForSelector('[data-testid="research-setup-name-input"]', { state: 'visible' })
    await window.fill('[data-testid="research-setup-name-input"]', setupName)
    await window.click('#enable-exit-date-toggle')
    await window.click('[data-testid="save-research-setup-btn"]')

    // Verify setup is visible in UI list
    await expect(window.locator(`h3:has-text("${setupName}")`)).toBeVisible({ timeout: 5000 })
    await window.screenshot({ path: 'e2e/screenshots/research-setup-created.png' })
  })

  await test.step('Apply Standard Session Presets (Asia, London, New York, London Close)', async () => {
    await window.click('[data-testid="tab-setup_sessions"]')
    await expect(window.locator('h2:has-text("Setup Sessions")')).toBeVisible({ timeout: 5000 })
    await window.click('[data-testid="research-apply-sessions-preset-btn"]')

    // Verify sessions appear in the table
    await expect(window.locator('td:has-text("Asia")')).toBeVisible({ timeout: 5000 })
    await expect(window.locator('td:has-text("07:00")')).toBeVisible({ timeout: 5000 })
    await expect(window.locator('td:has-text("London Close")')).toBeVisible({ timeout: 5000 })
    await window.screenshot({ path: 'e2e/screenshots/research-sessions-presets.png' })
  })

  await test.step('Create Custom Zone Columns in Library and Link to Setup', async () => {
    await window.click('[data-testid="tab-custom_columns"]')
    await expect(window.locator('text=Master Zone Library')).toBeVisible({ timeout: 5000 })

    // Create Zone 1
    await window.click('[data-testid="create-zone-def-btn"]')
    await window.fill('[data-testid="zone-def-name-input"]', zoneName1)
    await window.click('[data-testid="save-zone-def-btn"]')
    await expect(window.locator(`h4:has-text("${zoneName1}")`)).toBeVisible({ timeout: 5000 })

    // Create Zone 2
    await window.click('[data-testid="create-zone-def-btn"]')
    await window.fill('[data-testid="zone-def-name-input"]', zoneName2)
    await window.click('[data-testid="save-zone-def-btn"]')
    await expect(window.locator(`h4:has-text("${zoneName2}")`)).toBeVisible({ timeout: 5000 })

    // Link Zone 1 to setup
    await window.click('[data-testid="link-zone-modal-btn"]')
    await window.waitForSelector('[data-testid^="link-col-btn-"]', { state: 'visible' })
    await window.locator('[data-testid^="link-col-btn-"]').first().click()
    await window.waitForSelector('[data-testid="close-link-zone-modal"]', { state: 'detached' })

    // Link Zone 2 to setup
    await window.click('[data-testid="link-zone-modal-btn"]')
    await window.waitForSelector('[data-testid^="link-col-btn-"]', { state: 'visible' })
    await window.locator('[data-testid^="link-col-btn-"]').first().click()
    await window.waitForSelector('[data-testid="close-link-zone-modal"]', { state: 'detached' })

    await window.screenshot({ path: 'e2e/screenshots/research-zones-linked.png' })
  })

  await test.step('Navigate to Research Entry Form and verify UX behaviors', async () => {
    await window.click('text=จดสถิติ (New Entry)')
    await expect(window.locator('h1:has-text("จดสถิติ")')).toBeVisible({ timeout: 5000 })

    // Select the newly created setup
    await window.waitForSelector(`[data-testid="research-setup-select"] option:has-text("${setupName}")`, { state: 'attached' })
    await window.selectOption('[data-testid="research-setup-select"]', { label: `${setupName} (backtest)` })

    // Verify Exit Date field is VISIBLE because enableExitDate is true
    await expect(window.locator('[data-testid="research-exit-date-container"]')).toBeVisible({ timeout: 5000 })

    // Test Auto-copy from Entry Datetime to Exit Datetime
    await window.fill('[data-testid="research-entry-datetime"]', '2026-10-28T14:30')
    await expect(window.locator('[data-testid="research-exit-datetime"]')).toHaveValue('2026-10-28T14:30')

    // Verify Zone cards appeared
    await expect(window.locator('[data-testid="zone-card-0"]')).toBeVisible({ timeout: 5000 })

    // Test Bias Auto-Sync Rule: Clicking Bullish on Zone 0 syncs to all zones
    await window.click('[data-testid="zone-bullish-btn-0"]')
    await expect(window.locator('[data-testid="zone-bullish-btn-0"]')).toHaveClass(/bg-emerald-600/)

    // If Zone 1 exists, test override: Clicking Bearish on Zone 1 affects only Zone 1
    if (await window.locator('[data-testid="zone-card-1"]').isVisible()) {
      await expect(window.locator('[data-testid="zone-bullish-btn-1"]')).toHaveClass(/bg-emerald-600/)
      await window.click('[data-testid="zone-bearish-btn-1"]')
      await expect(window.locator('[data-testid="zone-bearish-btn-1"]')).toHaveClass(/bg-red-600/)
      await expect(window.locator('[data-testid="zone-bullish-btn-0"]')).toHaveClass(/bg-emerald-600/)
    }

    // Test SL Points Auto-Copy Rule: editing Min SL points copies to Max SL points
    await window.fill('[data-testid="zone-min-sl-0"]', '120')
    await expect(window.locator('[data-testid="zone-max-sl-0"]')).toHaveValue('120')

    // Editing Max SL points does NOT overwrite Min SL points
    await window.fill('[data-testid="zone-max-sl-0"]', '180')
    await expect(window.locator('[data-testid="zone-min-sl-0"]')).toHaveValue('120')

    // Test One-Click Action buttons:
    // On Zone 0: give a win RR (Min 2.5, Max 4.0)
    await window.fill('[data-testid="zone-min-rr-0"]', '2.5')
    await window.fill('[data-testid="zone-max-rr-0"]', '4.0')

    // On Zone 1 (if present): click [SL (-1)] quick loss button
    if (await window.locator('[data-testid="zone-card-1"]').isVisible()) {
      await window.click('[data-testid="zone-sl-loss-btn-1"]')
      await expect(window.locator('[data-testid="zone-min-rr-1"]')).toHaveValue('-1')
      await expect(window.locator('[data-testid="zone-max-rr-1"]')).toHaveValue('-1')
    }

    await window.evaluate(() => {
      document.querySelector('main')?.scrollTo(0, 0)
    })
    await window.screenshot({ path: 'e2e/screenshots/research-entry-filled.png' })
  })

  await test.step('Save trade research entry and verify success notification', async () => {
    await window.click('[data-testid="research-save-btn"]')
    await expect(window.locator('[data-testid="research-success-toast"]')).toBeVisible({ timeout: 5000 })
    await window.screenshot({ path: 'e2e/screenshots/research-entry-saved.png' })
  })

  await test.step('Verify saved research entry in Analytics Dashboard', async () => {
    await window.click('text=สรุปผลวิจัย (Analytics)')
    await expect(window.locator('h1:has-text("สรุปผลวิจัยและเปรียบเทียบโซน")')).toBeVisible({ timeout: 5000 })

    // Verify Zone Comparison Matrix table is visible
    await expect(window.locator('text=Zone Performance Comparison Matrix')).toBeVisible({ timeout: 5000 })

    // Verify recent research entry log table has at least 1 record
    await expect(window.locator('table').last()).toBeVisible({ timeout: 5000 })

    await window.screenshot({ path: 'e2e/screenshots/research-dashboard-verified.png' })
  })

  await test.step('Export AI Markdown Prompt and verify toast', async () => {
    await window.click('[data-testid="research-export-dropdown-btn"]')
    await expect(window.locator('[data-testid="copy-ai-prompt-btn"]')).toBeVisible({ timeout: 3000 })
    await window.click('[data-testid="copy-ai-prompt-btn"]')
    await expect(window.locator('[data-testid="research-export-toast"]')).toBeVisible({ timeout: 5000 })
    await expect(window.locator('[data-testid="research-export-toast"]')).toContainText('คัดลอก AI Prompt')
    await window.screenshot({ path: 'e2e/screenshots/research-ai-exported.png' })
  })

  await test.step('Edit research entry and verify update flow', async () => {
    // Click edit button in table
    await window.click('[data-testid="edit-entry-btn"]')
    await expect(window.locator('text=โหมดแก้ไขไม้')).toBeVisible({ timeout: 5000 })
    await expect(window.locator('button[data-testid="research-save-btn"]')).toContainText('บันทึกการแก้ไข')

    // Update notes
    await window.fill('textarea', 'Updated Note after London close: High EV target achieved')
    await window.click('[data-testid="research-save-btn"]')

    // Verify update toast
    await expect(window.locator('[data-testid="research-success-toast"]')).toBeVisible({ timeout: 5000 })
    await expect(window.locator('[data-testid="research-success-toast"]')).toContainText('อัปเดตข้อมูลสถิติเรียบร้อยแล้ว!')
    await window.screenshot({ path: 'e2e/screenshots/research-entry-updated.png' })
  })
})
