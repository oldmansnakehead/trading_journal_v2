import { describe, it, expect } from 'vitest'
import {
  detectSessionFromTime,
  syncBiasValues,
  handleSlPointsChange,
  computeResearchAnalytics
} from './researchAnalytics'
import type { ResearchEntry, ResearchSession } from '../../../shared/types'

describe('researchAnalytics utils', () => {
  describe('detectSessionFromTime', () => {
    const mockSessions: ResearchSession[] = [
      {
        id: 1,
        setupId: 10,
        startTime: '08:00',
        endTime: '12:00',
        sessionName: 'Asia',
        createdAt: '',
        updatedAt: ''
      },
      {
        id: 2,
        setupId: 10,
        startTime: '14:00',
        endTime: '18:00',
        sessionName: 'London',
        createdAt: '',
        updatedAt: ''
      },
      {
        id: 3,
        setupId: 10,
        startTime: '19:00',
        endTime: '23:30',
        sessionName: 'New York',
        createdAt: '',
        updatedAt: ''
      }
    ]

    it('should detect London session when time is in range', () => {
      const result = detectSessionFromTime('2026-10-28T15:30:00', mockSessions)
      expect(result).toBe('London')
    })

    it('should detect Asia session when time is in range', () => {
      const result = detectSessionFromTime('2026-10-28T09:15:00', mockSessions)
      expect(result).toBe('Asia')
    })

    it('should return null when time does not match any session', () => {
      const result = detectSessionFromTime('2026-10-28T13:00:00', mockSessions)
      expect(result).toBeNull()
    })

    it('should handle overnight session properly', () => {
      const overnightSessions: ResearchSession[] = [
        {
          id: 4,
          setupId: 10,
          startTime: '22:00',
          endTime: '04:00',
          sessionName: 'Late Night',
          createdAt: '',
          updatedAt: ''
        }
      ]
      expect(detectSessionFromTime('2026-10-28T23:30:00', overnightSessions)).toBe('Late Night')
      expect(detectSessionFromTime('2026-10-28T02:15:00', overnightSessions)).toBe('Late Night')
      expect(detectSessionFromTime('2026-10-28T12:00:00', overnightSessions)).toBeNull()
    })
  })

  describe('syncBiasValues', () => {
    it('should sync all zones when the first column (index 0) changes', () => {
      const initial = [{ bias: 'Bullish' }, { bias: 'Bullish' }, { bias: 'Bearish' }]
      const result = syncBiasValues(initial, 0, 'Bearish')
      expect(result).toEqual([
        { bias: 'Bearish' },
        { bias: 'Bearish' },
        { bias: 'Bearish' }
      ])
    })

    it('should only override the specific column when index > 0', () => {
      const initial = [{ bias: 'Bullish' }, { bias: 'Bullish' }, { bias: 'Bullish' }]
      const result = syncBiasValues(initial, 1, 'Bearish')
      expect(result).toEqual([
        { bias: 'Bullish' },
        { bias: 'Bearish' },
        { bias: 'Bullish' }
      ])
    })
  })

  describe('handleSlPointsChange', () => {
    it('should auto-copy minSlPoints to maxSlPoints when min changes', () => {
      const zone = { minSlPoints: null, maxSlPoints: null }
      const updated = handleSlPointsChange(zone, 'min', 150)
      expect(updated.minSlPoints).toBe(150)
      expect(updated.maxSlPoints).toBe(150)
    })

    it('should only update maxSlPoints and keep minSlPoints unchanged when max changes', () => {
      const zone = { minSlPoints: 150, maxSlPoints: 150 }
      const updated = handleSlPointsChange(zone, 'max', 200)
      expect(updated.minSlPoints).toBe(150)
      expect(updated.maxSlPoints).toBe(200)
    })
  })

  describe('computeResearchAnalytics', () => {
    const mockEntries: ResearchEntry[] = [
      {
        id: 1,
        setupId: 1,
        symbolId: 1,
        entryDatetime: '2026-10-28T10:00:00',
        zones: [
          {
            id: 101,
            researchEntryId: 1,
            customColumnId: 1,
            customColumnName: 'Zone FVG',
            isMissed: false,
            minRr: 2.0,
            maxRr: 3.5,
            slPoints: 100,
            realSlPoints: 40,
            minSlPoints: 100,
            outcome: 'win',
            createdAt: '',
            updatedAt: ''
          },
          {
            id: 102,
            researchEntryId: 1,
            customColumnId: 2,
            customColumnName: 'Zone OB',
            isMissed: true, // ตกรถ
            minRr: null,
            maxRr: null,
            minSlPoints: 80,
            outcome: 'missed',
            createdAt: '',
            updatedAt: ''
          }
        ],
        createdAt: '',
        updatedAt: ''
      },
      {
        id: 2,
        setupId: 1,
        symbolId: 1,
        entryDatetime: '2026-10-28T14:00:00',
        zones: [
          {
            id: 201,
            researchEntryId: 2,
            customColumnId: 1,
            customColumnName: 'Zone FVG',
            isMissed: false,
            minRr: -1.0, // Loss = -1
            maxRr: -1.0,
            slPoints: 100,
            realSlPoints: null, // Deep loss / outlier is left blank
            minSlPoints: 100,
            outcome: 'loss',
            createdAt: '',
            updatedAt: ''
          },
          {
            id: 202,
            researchEntryId: 2,
            customColumnId: 2,
            customColumnName: 'Zone OB',
            isMissed: false,
            minRr: 3.0,
            maxRr: 5.0,
            slPoints: 80,
            realSlPoints: 30,
            minSlPoints: 80,
            outcome: 'win',
            createdAt: '',
            updatedAt: ''
          }
        ],
        createdAt: '',
        updatedAt: ''
      }
    ]

    it('should accurately compute fill rate, miss rate, win rate, and EV per zone', () => {
      const summary = computeResearchAnalytics(mockEntries)
      expect(summary.totalEntries).toBe(2)
      expect(summary.zoneMetrics.length).toBe(2)

      const fvg = summary.zoneMetrics.find((m) => m.customColumnId === 1)!
      expect(fvg.columnName).toBe('Zone FVG')
      expect(fvg.totalSamples).toBe(2)
      expect(fvg.formedCount).toBe(2)
      expect(fvg.noZoneCount).toBe(0)
      expect(fvg.formationRate).toBe(100)
      expect(fvg.filledCount).toBe(2)
      expect(fvg.missedCount).toBe(0)
      expect(fvg.fillRate).toBe(100)
      expect(fvg.missRate).toBe(0)
      expect(fvg.winCount).toBe(1)
      expect(fvg.lossCount).toBe(1)
      expect(fvg.winRate).toBe(50) // 1 win out of 2 filled
      expect(fvg.avgMinRr).toBe(0.5) // (2 + -1) / 2
      expect(fvg.avgMaxRr).toBe(1.25) // (3.5 + -1) / 2
      expect(fvg.avgSlPoints).toBe(100)
      expect(fvg.avgRealSlPoints).toBe(40) // Only the filled 40 is averaged; loss with null is excluded!

      const ob = summary.zoneMetrics.find((m) => m.customColumnId === 2)!
      expect(ob.columnName).toBe('Zone OB')
      expect(ob.totalSamples).toBe(2)
      expect(ob.filledCount).toBe(1)
      expect(ob.missedCount).toBe(1)
      expect(ob.fillRate).toBe(50)
      expect(ob.missRate).toBe(50)
      expect(ob.winCount).toBe(1)
      expect(ob.lossCount).toBe(0)
      expect(ob.winRate).toBe(100) // 1 win out of 1 filled trade (missed trade excluded from win rate)
      expect(ob.expectedValue).toBe(3.0) // 100% * 3 - 0% = 3.0
    })

    it('should assign badges properly', () => {
      const summary = computeResearchAnalytics(mockEntries)
      // Highest Win Rate -> Zone OB (100% vs 50%)
      expect(summary.highestWinRateZoneId).toBe(2)
      // Lowest Miss Rate -> Zone FVG (0% vs 50%)
      expect(summary.lowestMissRateZoneId).toBe(1)
      // Best EV -> Zone OB
      expect(summary.bestEvZoneId).toBe(2)
      // Highest Max RR -> Zone OB (5.0 vs 1.25)
      expect(summary.highestMaxRrZoneId).toBe(2)
    })
  })
})
