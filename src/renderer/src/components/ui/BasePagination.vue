<script setup lang="ts">
import { computed } from 'vue'
import { generateVisiblePages } from '../../utils/pagination'

const props = withDefaults(
  defineProps<{
    currentPage: number
    pageSize: number
    totalItems: number
    pageSizeOptions?: number[]
    itemLabel?: string
    showPageSizeSelector?: boolean
    showTotal?: boolean
  }>(),
  {
    pageSizeOptions: () => [10, 25, 50, 100],
    itemLabel: 'trades',
    showPageSizeSelector: true,
    showTotal: true
  }
)

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
  (e: 'update:pageSize', size: number): void
  (e: 'change', page: number): void
}>()

const totalPages = computed(() => {
  if (props.totalItems <= 0) return 1
  return Math.max(1, Math.ceil(props.totalItems / props.pageSize))
})

const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.currentPage - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  if (props.totalItems === 0) return 0
  return Math.min(props.currentPage * props.pageSize, props.totalItems)
})

const setPage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === props.currentPage) return
  emit('update:currentPage', page)
  emit('change', page)
}

const onPageSizeChange = (event: Event) => {
  const select = event.target as HTMLSelectElement
  const newSize = Number(select.value)
  if (!newSize || newSize === props.pageSize) return
  emit('update:pageSize', newSize)
  // Adjust current page if current page exceeds new total pages
  const newTotalPages = Math.max(1, Math.ceil(props.totalItems / newSize))
  if (props.currentPage > newTotalPages) {
    emit('update:currentPage', newTotalPages)
    emit('change', newTotalPages)
  }
}

// Generate pagination numbers with ellipsis (e.g. 1, 2, '...', 9, 10)
const visiblePages = computed<(number | string)[]>(() => {
  return generateVisiblePages(totalPages.value, props.currentPage)
})
</script>

<template>
  <div
    class="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-white border-t border-gray-100 text-sm text-gray-600 select-none"
    data-testid="base-pagination"
  >
    <!-- Left: Total Info & Page Size Selector -->
    <div class="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
      <div v-if="showTotal" class="text-gray-500 font-medium">
        Showing
        <span class="font-semibold text-gray-800">{{ startItem }}</span>
        to
        <span class="font-semibold text-gray-800">{{ endItem }}</span>
        of
        <span class="font-semibold text-gray-800">{{ totalItems }}</span>
        {{ itemLabel }}
      </div>

      <div v-if="showPageSizeSelector" class="flex items-center gap-2 text-gray-500">
        <span>Rows per page:</span>
        <select
          :value="pageSize"
          @change="onPageSizeChange"
          data-testid="pagination-page-size-select"
          class="bg-gray-50 border border-gray-200 text-gray-700 text-xs sm:text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer hover:border-gray-300 transition-colors"
        >
          <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>
    </div>

    <!-- Right: Page Navigation Controls -->
    <div class="flex items-center gap-1">
      <!-- First Page -->
      <button
        type="button"
        @click="setPage(1)"
        :disabled="currentPage <= 1"
        data-testid="pagination-first-btn"
        class="inline-flex items-center justify-center p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
        title="First page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
          <path d="M196.24,195.76a6,6,0,0,1-8.48,8.48l-80-80a6,6,0,0,1,0-8.48l80-80a6,6,0,0,1,8.48,8.48L120.49,120ZM116.24,195.76a6,6,0,0,1-8.48,8.48l-80-80a6,6,0,0,1,0-8.48l80-80a6,6,0,0,1,8.48,8.48L40.49,120Z"/>
        </svg>
      </button>

      <!-- Previous Page -->
      <button
        type="button"
        @click="setPage(currentPage - 1)"
        :disabled="currentPage <= 1"
        data-testid="pagination-prev-btn"
        class="inline-flex items-center justify-center p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
        title="Previous page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
          <path d="M164.24,204.24a6,6,0,0,1-8.48,0l-80-80a6,6,0,0,1,0-8.48l80-80a6,6,0,0,1,8.48,8.48L88.49,120l75.75,75.76A6,6,0,0,1,164.24,204.24Z"/>
        </svg>
      </button>

      <!-- Page Numbers -->
      <template v-for="(p, idx) in visiblePages" :key="idx">
        <span
          v-if="p === '...'"
          class="px-2 py-1 text-xs text-gray-400 select-none"
        >
          ...
        </span>
        <button
          v-else
          type="button"
          @click="setPage(p as number)"
          :data-testid="`pagination-page-${p}`"
          :class="[
            'min-w-[32px] h-8 px-2 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer',
            p === currentPage
              ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          {{ p }}
        </button>
      </template>

      <!-- Next Page -->
      <button
        type="button"
        @click="setPage(currentPage + 1)"
        :disabled="currentPage >= totalPages"
        data-testid="pagination-next-btn"
        class="inline-flex items-center justify-center p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
        title="Next page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
          <path d="M180.24,124.24l-80,80a6,6,0,0,1-8.48-8.48L167.51,120,91.76,44.24a6,6,0,0,1,8.48-8.48l80,80A6,6,0,0,1,180.24,124.24Z"/>
        </svg>
      </button>

      <!-- Last Page -->
      <button
        type="button"
        @click="setPage(totalPages)"
        :disabled="currentPage >= totalPages"
        data-testid="pagination-last-btn"
        class="inline-flex items-center justify-center p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
        title="Last page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
          <path d="M140.24,124.24l-80,80a6,6,0,0,1-8.48-8.48L127.51,120,51.76,44.24a6,6,0,0,1,8.48-8.48l80,80A6,6,0,0,1,140.24,124.24ZM220.24,124.24l-80,80a6,6,0,0,1-8.48-8.48L207.51,120,131.76,44.24a6,6,0,0,1,8.48-8.48l80,80A6,6,0,0,1,220.24,124.24Z"/>
        </svg>
      </button>
    </div>
  </div>
</template>
