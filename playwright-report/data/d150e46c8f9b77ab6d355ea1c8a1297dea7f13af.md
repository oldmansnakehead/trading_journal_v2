# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fill-trade.spec.ts >> fill trade and save
- Location: e2e\fill-trade.spec.ts:16:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('text=Settings')
    - locator resolved to <span>Settings</span>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    55 × waiting for element to be visible, enabled and stable
       - element is not visible
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [ref=f1e4]:
  - banner [ref=f1e5]:
    - generic [ref=f1e6]:
      - button
      - generic [ref=f1e7]:
        - img "Team" [ref=f1e9]
        - text: Team 1
        - generic [ref=f1e10]: Free
    - generic [ref=f1e11]:
      - button [ref=f1e12] [cursor=pointer]
      - button [ref=f1e13] [cursor=pointer]
      - button [ref=f1e15] [cursor=pointer]:
        - img "Avatar" [ref=f1e16]
  - main [ref=f1e17]:
    - generic [ref=f1e19]:
      - generic [ref=f1e21]:
        - generic [ref=f1e22]:
          - heading "Welcome back 👋 Trader" [level=2] [ref=f1e23]: Welcome back 👋Trader
          - paragraph [ref=f1e24]: Ready to journal your trades today? Let's review your performance and setups.
          - button "Add New Trade" [ref=f1e25] [cursor=pointer]
        - img "Graphic" [ref=f1e27]
      - generic [ref=f1e36] [cursor=pointer]:
        - generic [ref=f1e37]: Tip of the day
        - heading "Stick to your trading plan..." [level=3] [ref=f1e38]
        - paragraph [ref=f1e39]: Consistency is key in trading. Follow your risk management rules strictly.
      - generic [ref=f1e42]:
        - heading "Total Trades" [level=6] [ref=f1e43]
        - heading "145" [level=3] [ref=f1e44]
        - generic [ref=f1e45]:
          - generic [ref=f1e46]: 0%
          - generic [ref=f1e47]: this month
      - generic [ref=f1e57]:
        - heading "Win Rate" [level=6] [ref=f1e58]
        - heading "68%" [level=3] [ref=f1e59]
        - generic [ref=f1e60]:
          - generic [ref=f1e61]: 0%
          - generic [ref=f1e62]: this month
      - generic [ref=f1e72]:
        - heading "Total Profit/Loss" [level=6] [ref=f1e73]
        - heading "+$4,250" [level=3] [ref=f1e74]
        - generic [ref=f1e75]:
          - generic [ref=f1e76]: 0%
          - generic [ref=f1e77]: vs last month
      - generic [ref=f1e86]:
        - generic:
          - generic:
            - generic [ref=f1e87]:
              - heading "Monthly Performance" [level=6] [ref=f1e88]
              - paragraph [ref=f1e89]: Profit and Loss over time
            - combobox [ref=f1e90] [cursor=pointer]:
              - option "2026" [selected]
              - option "2025"
        - generic: Chart Placeholder (Bar)
      - generic [ref=f1e94]:
        - generic:
          - heading "Setups" [level=6]
          - paragraph: Win rate by setup type
        - generic: Chart Placeholder (Donut)
      - generic [ref=f1e98]:
        - generic:
          - heading "Recent Trades" [level=6]
        - generic:
          - table [ref=f1e100]:
            - rowgroup [ref=f1e101]:
              - row [ref=f1e102]:
                - columnheader "Trade ID" [ref=f1e103]
                - columnheader "Pair" [ref=f1e104]
                - columnheader "Result" [ref=f1e105]
                - columnheader "Status" [ref=f1e106]
                - columnheader [ref=f1e107]
            - rowgroup [ref=f1e108]:
              - row [ref=f1e109]:
                - cell "TRD-1021" [ref=f1e110]
                - cell "XAUUSD" [ref=f1e111]
                - cell "+$450.00" [ref=f1e112]
                - cell "Win" [ref=f1e113]
                - cell [ref=f1e115]:
                  - button
              - row [ref=f1e116]:
                - cell "TRD-1020" [ref=f1e117]
                - cell "EURUSD" [ref=f1e118]
                - cell "-$120.00" [ref=f1e119]
                - cell "Loss" [ref=f1e120]
                - cell [ref=f1e122]:
                  - button
              - row [ref=f1e123]:
                - cell "TRD-1019" [ref=f1e124]
                - cell "BTCUSD" [ref=f1e125]
                - cell "$0.00" [ref=f1e126]
                - cell "Breakeven" [ref=f1e127]
                - cell [ref=f1e129]:
                  - button
          - link "View all" [ref=f1e131] [cursor=pointer]:
            - /url: "#"
```

# Test source

```ts
  1  | import { _electron as electron } from 'playwright'
  2  | import { test, expect, ElectronApplication, Page } from '@playwright/test'
  3  | 
  4  | let electronApp: ElectronApplication
  5  | let window: Page
  6  | 
  7  | test.beforeAll(async () => {
  8  |   electronApp = await electron.launch({ args: ['.'] })
  9  |   window = await electronApp.firstWindow()
  10 | })
  11 | 
  12 | test.afterAll(async () => {
  13 |   await electronApp.close()
  14 | })
  15 | 
  16 | test('fill trade and save', async () => {
  17 |   await window.waitForSelector('#app', { state: 'attached' })
  18 |   
> 19 |   await window.click('text=Settings')
     |                ^ Error: page.click: Target page, context or browser has been closed
  20 |   
  21 |   await window.click('button:has-text("Setups")')
  22 |   await window.click('text=Add Setup')
  23 |   await window.fill('input[placeholder="e.g. SMC Classic"]', 'SMC Test')
  24 |   await window.click('button:has-text("Save Setup")')
  25 |   await window.waitForTimeout(500)
  26 | 
  27 |   await window.click('button:has-text("Symbols")')
  28 |   await window.click('text=Add Symbol')
  29 |   await window.fill('input[placeholder="e.g. EURUSD, BTCUSDT"]', 'BTCUSDT')
  30 |   await window.click('button:has-text("Save Symbol")')
  31 |   await window.waitForTimeout(500)
  32 | 
  33 |   await window.click('text=New Trade')
  34 |   await window.waitForSelector('text=New Journal Entry')
  35 | 
  36 |   const dtInputs = window.locator('input[type="datetime-local"]')
  37 |   await dtInputs.first().fill('2026-10-10T10:00')
  38 | 
  39 |   const selects = window.locator('select')
  40 |   await selects.nth(0).selectOption({ index: 1 })
  41 |   await selects.nth(1).selectOption({ index: 1 })
  42 |   
  43 |   const slInputs = window.locator('input[type="number"]')
  44 |   await slInputs.first().fill('10') 
  45 |   
  46 |   await window.click('button:has-text("Save Entry")')
  47 | 
  48 |   await window.waitForSelector('text=Entry saved successfully!', { timeout: 5000 })
  49 |   
  50 |   await window.screenshot({ path: 'scratch/toast-success.png' })
  51 | })
  52 | 
```