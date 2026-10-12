<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import ExportExcelButton from '../ui/ExportExcelButton.vue'

const props = defineProps<{
  data?: {
    trades?: any[]
    kpis?: any
    statMode?: string
    variant?: 'outline' | 'primary' | 'secondary' | 'compact'
    label?: string
  }
}>()

const sampleTrades = props.data?.trades || [
  { id: 1, setupName: 'Breakout', symbol: 'EURUSD', pnl: 150, normalRr: 1.5, entryDatetime: '2026-10-10' },
  { id: 2, setupName: 'Pullback', symbol: 'XAUUSD', pnl: -100, normalRr: -1.0, entryDatetime: '2026-10-11' }
]
</script>

<template>
  <div class="bg-white rounded-2xl shadow-card p-4 min-w-[280px] border border-gray-100 relative">
    <Handle type="target" :position="Position.Top" class="!bg-gray-300" />

    <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="text-emerald-600">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
      </svg>
      Excel Export Node
    </div>

    <div class="pt-1 pb-1">
      <ExportExcelButton
        :trades="sampleTrades"
        :kpis="props.data?.kpis"
        :statMode="props.data?.statMode || 'normal'"
        :variant="props.data?.variant || 'outline'"
        :label="props.data?.label || 'Export Excel'"
      />
    </div>

    <Handle type="source" :position="Position.Bottom" class="!bg-emerald-500" />
  </div>
</template>
