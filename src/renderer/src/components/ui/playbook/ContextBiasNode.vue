<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

defineProps<{
  id: string
  data: {
    title: string
    description?: string
    timeframe?: string
    bias?: 'Bullish' | 'Bearish' | 'Neutral'
  }
  selected?: boolean
}>()
</script>

<template>
  <div
    class="min-w-[220px] max-w-[280px] bg-white rounded-xl border-2 shadow-sm transition-all duration-150 overflow-hidden"
    :class="[
      selected ? 'border-sky-500 shadow-md ring-2 ring-sky-200' : 'border-sky-200 hover:border-sky-300'
    ]"
  >
    <!-- Top target handle -->
    <Handle type="target" :position="Position.Top" class="!bg-sky-500 !w-3 !h-3 !border-2 !border-white" />

    <!-- Node Header -->
    <div class="bg-sky-50 px-3.5 py-2 border-b border-sky-100 flex items-center justify-between">
      <div class="flex items-center gap-1.5 text-sky-800 font-bold text-xs uppercase tracking-wider">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
        </svg>
        <span>Context & Bias</span>
      </div>
      <span
        v-if="data.bias"
        class="text-[10px] font-extrabold px-1.5 py-0.5 rounded"
        :class="{
          'bg-green-100 text-green-700': data.bias === 'Bullish',
          'bg-red-100 text-red-700': data.bias === 'Bearish',
          'bg-gray-100 text-gray-700': data.bias === 'Neutral'
        }"
      >
        {{ data.bias }}
      </span>
    </div>

    <!-- Node Body -->
    <div class="p-3 bg-white">
      <div class="font-bold text-sm text-gray-900 leading-snug mb-1">
        {{ data.title || 'Market Context' }}
      </div>
      <div v-if="data.description" class="text-xs text-gray-500 line-clamp-3 leading-relaxed">
        {{ data.description }}
      </div>
      <div v-if="data.timeframe" class="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-sky-600 bg-sky-50/60 px-2 py-0.5 rounded w-fit">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>TF: {{ data.timeframe }}</span>
      </div>
    </div>

    <!-- Bottom source handle -->
    <Handle type="source" :position="Position.Bottom" class="!bg-sky-500 !w-3 !h-3 !border-2 !border-white" />
  </div>
</template>
