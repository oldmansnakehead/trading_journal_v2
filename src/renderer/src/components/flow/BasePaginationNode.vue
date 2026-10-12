<script setup lang="ts">
import { ref } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import BasePagination from '../ui/BasePagination.vue'

const props = defineProps<{
  data?: {
    totalItems?: number
    initialPage?: number
    initialPageSize?: number
  }
}>()

const currentPage = ref(props.data?.initialPage || 1)
const pageSize = ref(props.data?.initialPageSize || 10)
const totalItems = ref(props.data?.totalItems ?? 42)
</script>

<template>
  <div class="bg-white rounded-2xl shadow-card p-4 min-w-[550px] border border-gray-100 relative">
    <Handle type="target" :position="Position.Top" class="!bg-gray-300" />

    <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
        <path d="M140.24,124.24l-80,80a6,6,0,0,1-8.48-8.48L127.51,120,51.76,44.24a6,6,0,0,1,8.48-8.48l80,80A6,6,0,0,1,140.24,124.24Z"/>
      </svg>
      Table Pagination Node
    </div>

    <BasePagination
      v-model:currentPage="currentPage"
      v-model:pageSize="pageSize"
      :totalItems="totalItems"
    />

    <Handle type="source" :position="Position.Bottom" class="!bg-primary" />
  </div>
</template>
