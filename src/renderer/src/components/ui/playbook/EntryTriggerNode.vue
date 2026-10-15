<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

defineProps<{
  id: string
  data: {
    title: string
    description?: string
    orderType?: 'Market' | 'Limit' | 'Stop'
    confirmation?: string
  }
  selected?: boolean
}>()
</script>

<template>
  <div
    class="min-w-[220px] max-w-[280px] bg-white rounded-xl border-2 shadow-sm transition-all duration-150 overflow-hidden"
    :class="[
      selected ? 'border-emerald-500 shadow-md ring-2 ring-emerald-200' : 'border-emerald-200 hover:border-emerald-300'
    ]"
  >
    <!-- Top target handle -->
    <Handle type="target" :position="Position.Top" class="!bg-emerald-500 !w-3 !h-3 !border-2 !border-white" />

    <!-- Node Header -->
    <div class="bg-emerald-50 px-3.5 py-2 border-b border-emerald-100 flex items-center justify-between">
      <div class="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        <span>Entry Trigger</span>
      </div>
      <span
        v-if="data.orderType"
        class="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800"
      >
        {{ data.orderType }}
      </span>
    </div>

    <!-- Node Body -->
    <div class="p-3 bg-white">
      <div class="font-bold text-sm text-gray-900 leading-snug mb-1">
        {{ data.title || 'Execute Entry' }}
      </div>
      <div v-if="data.description" class="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-2">
        {{ data.description }}
      </div>
      <div v-if="data.confirmation" class="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50/70 px-2 py-0.5 rounded w-fit">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>Confirm: {{ data.confirmation }}</span>
      </div>
    </div>

    <!-- Bottom source handle -->
    <Handle type="source" :position="Position.Bottom" class="!bg-emerald-500 !w-3 !h-3 !border-2 !border-white" />
  </div>
</template>
