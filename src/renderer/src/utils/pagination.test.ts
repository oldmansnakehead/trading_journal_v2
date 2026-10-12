import { describe, it, expect } from 'vitest'
import {
  calculatePagination,
  paginateItems,
  generateVisiblePages
} from './pagination'

describe('pagination utils', () => {
  describe('calculatePagination', () => {
    it('handles empty items correctly', () => {
      const res = calculatePagination(0, 1, 10)
      expect(res).toEqual({
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1,
        startItem: 0,
        endItem: 0,
        hasNext: false,
        hasPrev: false
      })
    })

    it('calculates page 1 correctly with 25 items and 10 items per page', () => {
      const res = calculatePagination(25, 1, 10)
      expect(res).toEqual({
        currentPage: 1,
        pageSize: 10,
        totalItems: 25,
        totalPages: 3,
        startItem: 1,
        endItem: 10,
        hasNext: true,
        hasPrev: false
      })
    })

    it('calculates page 2 correctly', () => {
      const res = calculatePagination(25, 2, 10)
      expect(res.startItem).toBe(11)
      expect(res.endItem).toBe(20)
      expect(res.hasNext).toBe(true)
      expect(res.hasPrev).toBe(true)
    })

    it('calculates last page correctly with remaining items', () => {
      const res = calculatePagination(25, 3, 10)
      expect(res.startItem).toBe(21)
      expect(res.endItem).toBe(25)
      expect(res.hasNext).toBe(false)
      expect(res.hasPrev).toBe(true)
    })

    it('clamps currentPage when out of upper bound', () => {
      const res = calculatePagination(25, 99, 10)
      expect(res.currentPage).toBe(3)
    })

    it('clamps currentPage when below 1', () => {
      const res = calculatePagination(25, -2, 10)
      expect(res.currentPage).toBe(1)
    })
  })

  describe('paginateItems', () => {
    const items = Array.from({ length: 30 }, (_, i) => i + 1)

    it('slices items for page 1', () => {
      const page1 = paginateItems(items, 1, 10)
      expect(page1).toHaveLength(10)
      expect(page1[0]).toBe(1)
      expect(page1[9]).toBe(10)
    })

    it('slices items for page 2', () => {
      const page2 = paginateItems(items, 2, 10)
      expect(page2).toHaveLength(10)
      expect(page2[0]).toBe(11)
      expect(page2[9]).toBe(20)
    })

    it('returns empty array when input is empty', () => {
      expect(paginateItems([], 1, 10)).toEqual([])
    })
  })

  describe('generateVisiblePages', () => {
    it('returns all pages when totalPages <= 7', () => {
      expect(generateVisiblePages(5, 1)).toEqual([1, 2, 3, 4, 5])
      expect(generateVisiblePages(7, 3)).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('shows starting ellipsis when currentPage <= 4 on large totalPages', () => {
      expect(generateVisiblePages(10, 2)).toEqual([1, 2, 3, 4, 5, '...', 10])
    })

    it('shows trailing ellipsis when currentPage >= totalPages - 3', () => {
      expect(generateVisiblePages(10, 9)).toEqual([1, '...', 6, 7, 8, 9, 10])
    })

    it('shows ellipsis on both sides when in the middle', () => {
      expect(generateVisiblePages(15, 8)).toEqual([1, '...', 7, 8, 9, '...', 15])
    })
  })
})
