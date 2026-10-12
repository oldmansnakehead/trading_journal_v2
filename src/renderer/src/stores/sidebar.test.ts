import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSidebarStore } from './sidebar'

describe('useSidebarStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with isVisible = true by default', () => {
    const store = useSidebarStore()
    expect(store.isVisible).toBe(true)
    expect(store.isCollapsed).toBe(false)
    expect(store.isMobileOpen).toBe(false)
  })

  it('toggles sidebar visibility', () => {
    const store = useSidebarStore()
    expect(store.isVisible).toBe(true)
    store.toggleSidebar()
    expect(store.isVisible).toBe(false)
    store.toggleSidebar()
    expect(store.isVisible).toBe(true)
  })

  it('sets visibility explicitly', () => {
    const store = useSidebarStore()
    store.setVisible(false)
    expect(store.isVisible).toBe(false)
    store.setVisible(true)
    expect(store.isVisible).toBe(true)
  })

  it('toggles mini collapse mode', () => {
    const store = useSidebarStore()
    expect(store.isCollapsed).toBe(false)
    store.toggleCollapse()
    expect(store.isCollapsed).toBe(true)
    store.toggleCollapse()
    expect(store.isCollapsed).toBe(false)
  })

  it('sets collapsed state explicitly', () => {
    const store = useSidebarStore()
    store.setCollapsed(true)
    expect(store.isCollapsed).toBe(true)
    store.setCollapsed(false)
    expect(store.isCollapsed).toBe(false)
  })

  it('manages mobile drawer state', () => {
    const store = useSidebarStore()
    expect(store.isMobileOpen).toBe(false)
    store.openMobile()
    expect(store.isMobileOpen).toBe(true)
    store.closeMobile()
    expect(store.isMobileOpen).toBe(false)
    store.toggleMobile()
    expect(store.isMobileOpen).toBe(true)
  })
})
