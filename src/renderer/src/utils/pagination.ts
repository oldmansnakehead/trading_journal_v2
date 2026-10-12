/**
 * Pagination helper utilities for table and list views
 */

export interface PaginationInfo {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  startItem: number
  endItem: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * Calculate pagination metadata from total items, current page, and page size
 */
export function calculatePagination(
  totalItems: number,
  currentPage: number,
  pageSize: number
): PaginationInfo {
  const safePageSize = Math.max(1, pageSize)
  const safeTotalItems = Math.max(0, totalItems)
  const totalPages = Math.max(1, Math.ceil(safeTotalItems / safePageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)

  const startItem = safeTotalItems === 0 ? 0 : (safeCurrentPage - 1) * safePageSize + 1
  const endItem = safeTotalItems === 0 ? 0 : Math.min(safeCurrentPage * safePageSize, safeTotalItems)

  return {
    currentPage: safeCurrentPage,
    pageSize: safePageSize,
    totalItems: safeTotalItems,
    totalPages,
    startItem,
    endItem,
    hasNext: safeCurrentPage < totalPages,
    hasPrev: safeCurrentPage > 1
  }
}

/**
 * Slice an array of items for the given page
 */
export function paginateItems<T>(items: T[], currentPage: number, pageSize: number): T[] {
  if (!items || items.length === 0) return []
  const { currentPage: page, pageSize: size } = calculatePagination(items.length, currentPage, pageSize)
  const start = (page - 1) * size
  return items.slice(start, start + size)
}

/**
 * Generate visible page numbers with ellipsis (e.g. [1, 2, 3, 4, 5, '...', 10])
 */
export function generateVisiblePages(totalPages: number, currentPage: number): (number | string)[] {
  const total = Math.max(1, totalPages)
  const current = Math.min(Math.max(1, currentPage), total)

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
}
