import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useResearchEntryStore } from './researchEntry'

describe('useResearchEntryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Mock global window and window.api
    const mockApi = {
      research: {
        setups: {
          list: vi.fn().mockResolvedValue({
            success: true,
            data: [
              { id: 1, name: 'Setup A', type: 'backtest', enableExitDate: false },
              { id: 2, name: 'Setup B', type: 'real', enableExitDate: true }
            ]
          }),
          getDetails: vi.fn().mockImplementation((id: number) => {
            return Promise.resolve({
              success: true,
              data: {
                id,
                name: id === 1 ? 'Setup A' : 'Setup B',
                enableExitDate: id === 2,
                sessions: [
                  { id: 10, setupId: id, startTime: '14:00', endTime: '18:00', sessionName: 'London' }
                ],
                customColumns: [
                  { id: 101, name: 'Zone FVG', type: 'zone_group' },
                  { id: 102, name: 'Zone OB', type: 'zone_group' }
                ]
              }
            })
          })
        },
        entries: {
          create: vi.fn().mockResolvedValue({ success: true, data: { id: 999 } }),
          get: vi.fn().mockResolvedValue({
            success: true,
            data: {
              id: 42,
              setupId: 2,
              symbolId: 50,
              entryDatetime: '2026-10-28T15:00',
              exitDatetime: '2026-10-28T16:00',
              sessionName: 'London',
              timeframe: 'M5',
              news: true,
              quality: 'A+',
              notes: 'Retest of Extreme OB',
              images: ['test.png'],
              zones: [
                {
                  customColumnId: 101,
                  bias: 'Bullish',
                  minRr: 2,
                  maxRr: 5,
                  minSlPoints: 120,
                  maxSlPoints: 120,
                  isMissed: false,
                  outcome: 'win',
                  notes: 'Touched zone cleanly'
                }
              ]
            }
          }),
          update: vi.fn().mockResolvedValue({ success: true, data: { id: 42 } })
        }
      },
      symbols: {
        list: vi.fn().mockResolvedValue({
          success: true,
          data: [{ id: 50, name: 'XAUUSD' }]
        })
      }
    }

    ;(globalThis as any).window = {
      api: mockApi
    }
  })

  it('initializes and selects the first setup and symbol', async () => {
    const store = useResearchEntryStore()
    await store.initialize()

    expect(store.setupId).toBe(1)
    expect(store.symbolId).toBe(50)
    expect(store.enableExitDate).toBe(false)
    expect(store.zones.length).toBe(2)
    expect(store.zones[0].customColumnName).toBe('Zone FVG')
    expect(store.zones[1].customColumnName).toBe('Zone OB')
  })

  it('handles enableExitDate correctly when switching to Setup B', async () => {
    const store = useResearchEntryStore()
    await store.onSelectSetup(2)

    expect(store.setupId).toBe(2)
    expect(store.enableExitDate).toBe(true)
  })

  it('auto-copies entryDatetime into exitDatetime when onEntryDatetimeChange is called', () => {
    const store = useResearchEntryStore()
    store.entryDatetime = '2026-10-28T14:30'
    store.onEntryDatetimeChange()

    expect(store.exitDatetime).toBe('2026-10-28T14:30')
  })

  it('auto-syncs bias when first column is changed, and overrides individually for subsequent columns', async () => {
    const store = useResearchEntryStore()
    await store.onSelectSetup(1)

    // Initial bias is Bullish for all
    expect(store.zones[0].bias).toBe('Bullish')
    expect(store.zones[1].bias).toBe('Bullish')

    // Changing first column to Bearish -> syncs all
    store.onBiasChange(0, 'Bearish')
    expect(store.zones[0].bias).toBe('Bearish')
    expect(store.zones[1].bias).toBe('Bearish')

    // Changing second column to Bullish -> only changes second
    store.onBiasChange(1, 'Bullish')
    expect(store.zones[0].bias).toBe('Bearish')
    expect(store.zones[1].bias).toBe('Bullish')
  })

  it('handles Planned SL and Real SL (MAE) independently, and clears Real SL on loss', async () => {
    const store = useResearchEntryStore()
    await store.onSelectSetup(1)

    // Edit Planned SL points
    store.onSlPointsChange(0, 150)
    expect(store.zones[0].slPoints).toBe(150)

    // Edit Real SL points (drawdown before running to target)
    store.onRealSlPointsChange(0, 45)
    expect(store.zones[0].slPoints).toBe(150)
    expect(store.zones[0].realSlPoints).toBe(45)

    // Quick action: Loss = -1 clears Real SL automatically
    store.setZoneLoss(0)
    expect(store.zones[0].minRr).toBe(-1)
    expect(store.zones[0].maxRr).toBe(-1)
    expect(store.zones[0].realSlPoints).toBeNull()
  })

  it('applies Loss quick action with RR = -1', async () => {
    const store = useResearchEntryStore()
    await store.onSelectSetup(1)

    store.setZoneLoss(0)
    expect(store.zones[0].minRr).toBe(-1)
    expect(store.zones[0].maxRr).toBe(-1)
    expect(store.zones[0].outcome).toBe('loss')
    expect(store.zones[0].isMissed).toBe(false)
  })

  it('applies Break-Even quick action with RR = 0', async () => {
    const store = useResearchEntryStore()
    await store.onSelectSetup(1)

    store.setZoneBe(0)
    expect(store.zones[0].minRr).toBe(0)
    expect(store.zones[0].outcome).toBe('be')
    expect(store.zones[0].isMissed).toBe(false)
  })

  it('applies Missed quick action and clears RR', async () => {
    const store = useResearchEntryStore()
    await store.onSelectSetup(1)

    store.zones[0].minRr = 2.5
    store.setZoneMissed(0)
    expect(store.zones[0].isMissed).toBe(true)
    expect(store.zones[0].minRr).toBeNull()
    expect(store.zones[0].outcome).toBe('missed')
  })

  it('submits entry successfully and resets form', async () => {
    const store = useResearchEntryStore()
    await store.initialize()

    store.zones[0].minRr = 2
    store.zones[0].maxRr = 3

    const result = await store.submitEntry()
    expect(result.success).toBe(true)
    expect(window.api.research.entries.create).toHaveBeenCalled()
  })

  it('loads entry for editing, sets isEditMode, and updates entry on submit', async () => {
    const store = useResearchEntryStore()
    const loadRes = await store.loadEntryForEdit(42)

    expect(loadRes.success).toBe(true)
    expect(store.isEditMode).toBe(true)
    expect(store.editingEntryId).toBe(42)
    expect(store.setupId).toBe(2)
    expect(store.symbolId).toBe(50)
    expect(store.news).toBe(true)
    expect(store.quality).toBe('A+')
    expect(store.zones[0].minRr).toBe(2)
    expect(store.zones[0].maxRr).toBe(5)

    // Submit update
    const updateRes = await store.submitEntry()
    expect(updateRes.success).toBe(true)
    expect(updateRes.isUpdate).toBe(true)
    expect(window.api.research.entries.update).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        setupId: 2,
        symbolId: 50
      })
    )
  })

  it('cancels edit mode and resets the form', async () => {
    const store = useResearchEntryStore()
    await store.loadEntryForEdit(42)
    expect(store.isEditMode).toBe(true)

    store.cancelEdit()
    expect(store.isEditMode).toBe(false)
    expect(store.editingEntryId).toBeNull()
  })

  it('separates zone_group columns from regular custom fields and persists customData', async () => {
    // Add custom columns of various types to mock
    const customMockApi = {
      research: {
        setups: {
          list: vi.fn().mockResolvedValue({
            success: true,
            data: [{ id: 3, name: 'Setup Mixed', type: 'backtest', enableExitDate: false }]
          }),
          getDetails: vi.fn().mockResolvedValue({
            success: true,
            data: {
              id: 3,
              name: 'Setup Mixed',
              enableExitDate: false,
              sessions: [],
              customColumns: [
                { id: 201, name: 'Zone M15', type: 'zone_group' },
                { id: 202, name: 'Confluence Check', type: 'checkbox' },
                { id: 203, name: 'Market Structure', type: 'single_selector', options: ['BOS', 'CHoCH'] },
                { id: 204, name: 'Confirmations', type: 'multiple_selector', options: ['Engulfing', 'Pinbar', 'Volume'] }
              ]
            }
          })
        },
        entries: {
          create: vi.fn().mockResolvedValue({ success: true, data: { id: 100 } })
        }
      },
      symbols: {
        list: vi.fn().mockResolvedValue({
          success: true,
          data: [{ id: 50, name: 'XAUUSD' }]
        })
      }
    }
    ;(globalThis as any).window = { api: customMockApi }

    const store = useResearchEntryStore()
    await store.initialize()

    // Zones should only have the zone_group column
    expect(store.zones.length).toBe(1)
    expect(store.zones[0].customColumnId).toBe(201)
    expect(store.zones[0].customColumnName).toBe('Zone M15')

    // Field columns should have the remaining 3 columns
    expect(store.fieldColumns.length).toBe(3)
    expect(store.fieldColumns.map((c) => c.name)).toEqual([
      'Confluence Check',
      'Market Structure',
      'Confirmations'
    ])

    // Initialized customData
    expect(store.customData[202]).toBe(false)
    expect(store.customData[203]).toBeNull()
    expect(store.customData[204]).toEqual([])

    // Update field values
    store.customData[202] = true
    store.customData[203] = 'BOS'
    store.customData[204] = ['Engulfing', 'Volume']

    await store.submitEntry()

    expect(customMockApi.research.entries.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customData: {
          202: true,
          203: 'BOS',
          204: ['Engulfing', 'Volume']
        },
        zones: [
          expect.objectContaining({
            customColumnId: 201
          })
        ]
      })
    )
  })

  it('supports duplicating and removing duplicated zones within a setup', async () => {
    const store = useResearchEntryStore()
    await store.onSelectSetup(1)
    expect(store.zones.length).toBe(2)

    // Duplicate Zone 0
    store.duplicateZone(0)
    expect(store.zones.length).toBe(3)
    expect(store.zones[1].customColumnId).toBe(store.zones[0].customColumnId)
    expect(store.zones[1].zoneInstanceName).toContain('#2')

    // Remove the duplicated zone
    store.removeDuplicatedZone(1)
    expect(store.zones.length).toBe(2)
  })

  it('handles No-Zone state and invalidation reason attribution on loss', async () => {
    const store = useResearchEntryStore()
    await store.onSelectSetup(1)

    // Toggle No-Zone
    store.toggleZoneNoZone(0)
    expect(store.zones[0].isNoZone).toBe(true)
    expect(store.zones[0].outcome).toBe('no_zone')

    // Untoggle No-Zone
    store.toggleZoneNoZone(0)
    expect(store.zones[0].isNoZone).toBe(false)

    // Loss with Invalidation Reason
    store.setZoneLoss(0, 'สวน HTF')
    expect(store.zones[0].outcome).toBe('loss')
    expect(store.zones[0].invalidationReason).toBe('สวน HTF')
  })

  it('auto calculates holding duration in minutes from entry and exit times', async () => {
    const store = useResearchEntryStore()
    await store.onSelectSetup(1)

    store.zones[0].entryDatetime = '2026-10-30T10:00:00'
    store.zones[0].exitDatetime = '2026-10-30T10:45:00'
    store.onZoneTimeChange(0)

    expect(store.zones[0].holdingDurationMinutes).toBe(45)
  })
})
