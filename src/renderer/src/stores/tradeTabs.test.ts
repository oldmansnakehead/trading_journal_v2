import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTradeTabsStore } from './tradeTabs'

describe('useTradeTabsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with a single default tab', () => {
    const store = useTradeTabsStore()
    expect(store.tabs.length).toBe(1)
    expect(store.activeTabId).toBe(store.tabs[0].id)
    expect(store.activeTab).toBeDefined()
    expect(store.activeTab.form.position).toBe('Buy')
  })

  it('adds a new tab and switches to it', () => {
    const store = useTradeTabsStore()
    const newId = store.addTab()
    expect(store.tabs.length).toBe(2)
    expect(store.activeTabId).toBe(newId)
    expect(store.activeTab.id).toBe(newId)
  })

  it('duplicates an existing tab with its data', () => {
    const store = useTradeTabsStore()
    store.activeTab.form.setupId = 42
    store.activeTab.form.notes = 'Breakout strategy on H1'
    store.activeTab.imageUrls = ['https://example.com/chart.png']

    const dupId = store.duplicateTab(store.activeTab.id)
    expect(store.tabs.length).toBe(2)
    expect(store.activeTabId).toBe(dupId)
    expect(store.activeTab.form.setupId).toBe(42)
    expect(store.activeTab.form.notes).toBe('Breakout strategy on H1')
    expect(store.activeTab.imageUrls).toEqual(['https://example.com/chart.png'])
    expect(store.activeTab.id).not.toBe(store.tabs[0].id)
  })

  it('closes a tab and updates activeTab correctly', () => {
    const store = useTradeTabsStore()
    const id1 = store.tabs[0].id
    const id2 = store.addTab()

    expect(store.activeTabId).toBe(id2)
    store.closeTab(id2)
    expect(store.tabs.length).toBe(1)
    expect(store.activeTabId).toBe(id1)
  })

  it('resets a tab when closing the only remaining tab', () => {
    const store = useTradeTabsStore()
    const onlyId = store.tabs[0].id
    store.activeTab.form.notes = 'Draft trade'
    store.closeTab(onlyId)

    expect(store.tabs.length).toBe(1)
    expect(store.tabs[0].form.notes).toBe('')
  })

  it('validates required fields properly', () => {
    const store = useTradeTabsStore()
    const tab = store.activeTab

    // Missing fields
    let result = store.validateTab(tab)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Entry Date & Time')

    tab.form.entryDatetime = '2026-10-12T10:00'
    result = store.validateTab(tab)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Trading Setup')

    tab.form.setupId = 1
    result = store.validateTab(tab)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Symbol')

    tab.form.symbolId = 1
    result = store.validateTab(tab)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('At least one RR value')

    tab.form.normalRr = 2.5
    result = store.validateTab(tab)
    expect(result.valid).toBe(true)
  })

  it('generates dynamic display titles correctly', () => {
    const store = useTradeTabsStore()
    store.setups = [{ id: 1, name: 'Engulfing Bar' }]
    store.symbols = [{ id: 10, name: 'XAUUSD' }]

    store.activeTab.form.setupId = 1
    store.activeTab.form.symbolId = 10

    expect(store.getTabDisplayTitle(store.activeTab, 0)).toBe('XAUUSD • Engulfing Bar')
  })
})
