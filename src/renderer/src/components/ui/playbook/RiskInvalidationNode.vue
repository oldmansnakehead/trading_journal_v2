<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

defineProps<{
  id: string
  data: {
    title: string
    description?: string
    slRule?: string
    targetRr?: string
    invalidation?: string
  }
  selected?: boolean
}>()
</script>

<template>
  <div
    class="min-w-[220px] max-w-[280px] bg-white rounded-xl border-2 shadow-sm transition-all duration-150 overflow-hidden"
    :class="[
      selected ? 'border-rose-500 shadow-md ring-2 ring-rose-200' : 'border-rose-200 hover:border-rose-300'
    ]"
  >
    <!-- Top target handle -->
    <Handle type="target" :position="Position.Top" class="!bg-rose-500 !w-3 !h-3 !border-2 !border-white" />

    <!-- Node Header -->
    <div class="bg-rose-50 px-3.5 py-2 border-b border-rose-100 flex items-center justify-between">
      <div class="flex items-center gap-1.5 text-rose-800 font-bold text-xs uppercase tracking-wider">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>Risk & Exit</span>
      </div>
      <span
        v-if="data.targetRr"
        class="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800"
      >
        Target: {{ data.targetRr }}
      </span>
    </div>

    <!-- Node Body -->
    <div class="p-3 bg-white space-y-2">
      <div class="font-bold text-sm text-gray-900 leading-snug">
        {{ data.title || 'Risk & Invalidation' }}
      </div>
      <div v-if="data.description" class="text-xs text-gray-500 line-clamp-3 leading-relaxed">
        {{ data.description }}
      </div>
      
      <div v-if="data.slRule" class="text-[11px] font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded flex items-center gap-1">
        <span class="text-rose-600 font-bold">SL:</span> {{ data.slRule }}
      </div>

      <div v-if="data.invalidation" class="text-[11px] font-semibold text-rose-700 bg-rose-50/70 px-2 py-1 rounded flex items-center gap-1">
        <span class="font-bold">Invalidate:</span> {{ data.invalidation }}
      </div>
    </div>

    <!-- Bottom source handle -->
    <Handle type="source" :position="Position.Bottom" class="!bg-rose-500 !w-3 !h-3 !border-2 !border-white" />
  </div>
</template>
