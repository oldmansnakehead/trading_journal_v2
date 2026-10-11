<template>
  <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col gap-5">
    <!-- Top Row: Primary Filters -->
    <div class="flex flex-wrap gap-4 items-end">
      <div class="flex items-center gap-2 text-gray-500 mr-2 h-[38px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <span class="font-bold text-sm">Filters:</span>
      </div>

      <!-- Setup Filter -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-gray-500">Setup</label>
        <BaseSelect
          v-model="modelValue.setup"
          :options="[{ label: 'All Setups', value: 'all' }, ...setups.map((s) => ({ label: s.name, value: s.id }))]"
        />
      </div>

      <!-- Symbol Filter -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-gray-500">Symbol</label>
        <BaseSelect
          v-model="modelValue.symbol"
          :options="[{ label: 'All Symbols', value: 'all' }, ...symbols.map((s) => ({ label: s.name, value: s.id }))]"
        />
      </div>

      <!-- Session Filter -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-gray-500">Session</label>
        <BaseSelect
          v-model="modelValue.session"
          :options="availableSessions"
        />
      </div>

      <!-- Paper Trades Toggle -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-gray-500">Paper Trades</label>
        <label class="flex items-center gap-2 h-[38px] px-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors select-none">
          <input
            type="checkbox"
            v-model="modelValue.includePaperTrades"
            class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
          />
          <span class="text-xs font-semibold text-gray-700 whitespace-nowrap">Include Paper</span>
        </label>
      </div>

      <!-- From Date -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-gray-500">From</label>
        <input
          type="date"
          v-model="modelValue.startDate"
          class="w-32 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-blue-500"
        />
      </div>

      <!-- To Date -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-gray-500">To</label>
        <input
          type="date"
          v-model="modelValue.endDate"
          class="w-32 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-blue-500"
        />
      </div>

      <!-- Actions slot -->
      <slot name="actions" />
    </div>

    <!-- Middle Row: Custom Columns Filters -->
    <div
      v-if="reportCustomColumns && reportCustomColumns.length > 0"
      class="flex flex-wrap gap-4 items-end pt-5 border-t border-gray-100"
    >
      <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 h-[38px] flex items-center">
        Custom
      </div>
      <template v-for="col in reportCustomColumns" :key="col.id">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-gray-500">{{ col.name }}</label>
          <BaseSelect
            v-if="col.type === 'single_selector' || col.type === 'multiple_selector'"
            v-model="modelValue.customFields[col.id]"
            :options="[{ label: 'All', value: 'all' }, ...(typeof col.options === 'string' ? JSON.parse(col.options) : (col.options || [])).map((o: any) => ({ label: o, value: o }))]"
          />
          <BaseSelect
            v-else-if="col.type === 'switch' || col.type === 'checkbox'"
            v-model="modelValue.customFields[col.id]"
            :options="[{ label: 'All', value: 'all' }, { label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }]"
          />
          <input
            v-else-if="col.type === 'string'"
            type="text"
            v-model="modelValue.customFields[col.id]"
            :placeholder="'Filter...'"
            class="w-32 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-blue-500"
          />
          <input
            v-else-if="col.type === 'number'"
            type="number"
            step="any"
            v-model="modelValue.customFields[col.id]"
            :placeholder="'Filter...'"
            class="w-32 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-blue-500"
          />
        </div>
      </template>
    </div>

    <!-- Optional Simulation Row (for Dashboard) -->
    <div
      v-if="showSimulationRow && simulationModel"
      class="flex flex-wrap gap-4 items-end pt-5 border-t border-gray-100"
    >
      <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 h-[38px] flex items-center">
        Simulation
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-gray-500">Capital $</label>
        <input
          type="number"
          min="0"
          v-model.number="simulationModel.initialBalance"
          class="w-28 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-blue-500 font-semibold"
          placeholder="10000"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-gray-500">Risk %</label>
        <input
          type="number"
          min="0"
          step="0.1"
          v-model.number="simulationModel.riskPerTrade"
          class="w-20 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-blue-500 font-semibold"
          placeholder="1"
        />
      </div>

      <!-- Return Calculation (Simple vs Log Compounded) -->
      <div class="flex flex-col gap-1">
        <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Return Calculation</label>
        <div class="bg-gray-100 p-1 rounded-xl flex font-semibold text-xs border border-gray-200/60 shadow-2xs">
          <button
            type="button"
            @click="simulationModel.returnCalculation = 'simple'"
            :class="[
              'px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer',
              simulationModel.returnCalculation === 'simple'
                ? 'bg-white text-gray-900 shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-800'
            ]"
          >
            Simple
          </button>
          <button
            type="button"
            @click="simulationModel.returnCalculation = 'log'"
            :class="[
              'px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer',
              simulationModel.returnCalculation === 'log'
                ? 'bg-white text-gray-900 shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-800'
            ]"
          >
            Log (Compounded)
          </button>
        </div>
      </div>

      <button
        type="button"
        @click="$emit('reset')"
        class="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors ml-auto flex items-center gap-1 h-[38px] cursor-pointer"
      >
        <i class="ph-bold ph-x"></i> Clear All Filters
      </button>
    </div>

    <!-- Bottom Footer Slot (for statistics, banners, matching trades count) -->
    <slot name="footer" />
  </div>
</template>

<script setup lang="ts">
import BaseSelect from './BaseSelect.vue'
import type { TradeFiltersState } from '../../utils/tradeFilters'

interface Props {
  modelValue: TradeFiltersState
  setups?: { id: number; name: string }[]
  symbols?: { id: number; name: string }[]
  availableSessions?: { label: string; value: string }[]
  reportCustomColumns?: any[]
  showSimulationRow?: boolean
  simulationModel?: {
    initialBalance: number
    riskPerTrade: number
    returnCalculation: 'simple' | 'log'
  }
}

withDefaults(defineProps<Props>(), {
  setups: () => [],
  symbols: () => [],
  availableSessions: () => [
    { label: 'All Sessions', value: 'all' },
    { label: 'London', value: 'London' },
    { label: 'New York', value: 'New York' },
    { label: 'London Close', value: 'London Close' },
    { label: 'Asia', value: 'Asia' },
    { label: 'Tokyo', value: 'Tokyo' }
  ],
  reportCustomColumns: () => [],
  showSimulationRow: false
})

defineEmits<{
  (e: 'update:modelValue', value: TradeFiltersState): void
  (e: 'reset'): void
}>()
</script>
