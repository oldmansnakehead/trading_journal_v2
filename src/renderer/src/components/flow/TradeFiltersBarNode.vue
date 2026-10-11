<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import TradeFiltersBar from '../ui/TradeFiltersBar.vue'
import { createDefaultFilters } from '../../utils/tradeFilters'
import { ref } from 'vue'

const props = defineProps<{
  data?: {
    setups?: { id: number; name: string }[]
    symbols?: { id: number; name: string }[]
    showSimulationRow?: boolean
  }
}>()

const filters = ref(createDefaultFilters())
</script>

<template>
  <div class="bg-white rounded-2xl shadow-card p-4 min-w-[750px] border border-gray-100">
    <Handle type="target" :position="Position.Top" class="!bg-gray-300" />

    <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
      <i class="ph-bold ph-funnel text-primary"></i>
      Trade Filters Bar Node
    </div>

    <TradeFiltersBar
      v-model="filters"
      :setups="props.data?.setups || []"
      :symbols="props.data?.symbols || []"
      :show-simulation-row="props.data?.showSimulationRow || false"
    />

    <Handle type="source" :position="Position.Bottom" class="!bg-primary" />
  </div>
</template>
