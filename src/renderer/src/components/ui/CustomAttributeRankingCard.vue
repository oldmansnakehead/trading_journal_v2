<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  calculateAttributeRanking,
  AttributeRankingSummary,
  AttributeRankingItem
} from '../../utils/customAttributeRanking'
import InfoTooltip from './InfoTooltip.vue'
import BaseSelect from './BaseSelect.vue'

interface Props {
  trades: any[]
  availableColumns?: any[]
  statMode?: 'normal' | 'be' | 'trail'
}

const props = withDefaults(defineProps<Props>(), {
  trades: () => [],
  availableColumns: () => [],
  statMode: 'normal'
})

// Active selected column ID to analyze
const selectedColumnId = ref<number | ''>('')
const sortBy = ref<'winRate' | 'trades' | 'avgRr' | 'netR' | 'profitFactor'>('winRate')

// Filter out columns that have options or are categorical
const eligibleColumns = computed(() => {
  return props.availableColumns.filter((col) => {
    if (!col || !col.name) return false
    // Show single_selector, multiple_selector, or any column with options defined
    if (col.type === 'single_selector' || col.type === 'multiple_selector') return true
    if (col.options && (Array.isArray(col.options) ? col.options.length > 0 : String(col.options).trim().length > 0)) {
      return true
    }
    return false
  })
})

const columnSelectOptions = computed(() => {
  return eligibleColumns.value.map((col) => ({
    value: col.id,
    label: `${col.name}`
  }))
})

// Auto-select first available column if not set
watch(
  eligibleColumns,
  (cols) => {
    if (cols.length > 0) {
      if (selectedColumnId.value === '' || !cols.some((c) => c.id === selectedColumnId.value)) {
        selectedColumnId.value = cols[0].id
      }
    } else {
      selectedColumnId.value = ''
    }
  },
  { immediate: true }
)

const activeColumn = computed(() => {
  if (selectedColumnId.value === '') return null
  return eligibleColumns.value.find((c) => c.id === selectedColumnId.value) || null
})

const summary = computed<AttributeRankingSummary | null>(() => {
  if (!activeColumn.value) return null
  return calculateAttributeRanking(props.trades, activeColumn.value, props.statMode)
})

const sortedItems = computed<AttributeRankingItem[]>(() => {
  if (!summary.value) return []
  const list = [...summary.value.items]

  switch (sortBy.value) {
    case 'winRate':
      return list.sort((a, b) => b.winRate - a.winRate || b.totalTrades - a.totalTrades)
    case 'trades':
      return list.sort((a, b) => b.totalTrades - a.totalTrades || b.winRate - a.winRate)
    case 'avgRr':
      return list.sort((a, b) => b.avgRr - a.avgRr || b.winRate - a.winRate)
    case 'netR':
      return list.sort((a, b) => b.totalNetR - a.totalNetR || b.winRate - a.winRate)
    case 'profitFactor':
      return list.sort((a, b) => b.profitFactor - a.profitFactor || b.winRate - a.winRate)
    default:
      return list
  }
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <!-- Header Row -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100 shrink-0">
          <i class="ph-bold ph-trophy text-xl"></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-bold text-gray-900">
              Custom Attribute Ranking
            </h2>
            <InfoTooltip
              title="Custom Attribute Ranking (จัดอันดับตัวแปรเทคนิค)"
              description="วิเคราะห์ประสิทธิภาพ แยกตามค่าตัวเลือกของ Custom Column (เช่น Zone: FVG vs OB vs Breaker Block) เพื่อค้นหาว่าตัวแปรใดมี Win Rate และอัตราส่วนกำไรสูงที่สุด"
              formula="คำนวณ Win Rate, Total Trades, Avg RR และ Net R ของแต่ละค่าตามตัวกรองที่เลือก"
            />
          </div>
          <p class="text-xs text-gray-500 font-medium">
            จัดอันดับความได้เปรียบทางสถิติ (Edge) ตามตัวแปรที่เลือกในโหมด {{ statMode.toUpperCase() }}
          </p>
        </div>
      </div>

      <!-- Controls: Column Selector & Sort -->
      <div v-if="eligibleColumns.length > 0" class="flex flex-wrap items-center gap-3">
        <div class="w-48 sm:w-56">
          <BaseSelect
            id="attribute-ranking-column-select"
            v-model="selectedColumnId"
            :options="columnSelectOptions"
            placeholder="Select Attribute"
          />
        </div>

        <div class="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600">
          <button
            type="button"
            @click="sortBy = 'winRate'"
            :class="sortBy === 'winRate' ? 'bg-white shadow-2xs text-gray-900 font-bold' : 'hover:text-gray-900'"
            class="px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Win Rate
          </button>
          <button
            type="button"
            @click="sortBy = 'trades'"
            :class="sortBy === 'trades' ? 'bg-white shadow-2xs text-gray-900 font-bold' : 'hover:text-gray-900'"
            class="px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Trades
          </button>
          <button
            type="button"
            @click="sortBy = 'netR'"
            :class="sortBy === 'netR' ? 'bg-white shadow-2xs text-gray-900 font-bold' : 'hover:text-gray-900'"
            class="px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Net R
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State: No eligible custom columns -->
    <div
      v-if="eligibleColumns.length === 0"
      class="text-center py-10 px-4 border border-dashed border-gray-200 rounded-xl my-4 bg-gray-50/50"
    >
      <div class="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
        <i class="ph ph-tag text-2xl"></i>
      </div>
      <h3 class="text-sm font-bold text-gray-800">No Custom Columns with Options</h3>
      <p class="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-4">
        Create custom columns with predefined options (e.g. Zone: FVG, OB, Breaker Block) in Settings to unlock attribute performance ranking.
      </p>
      <router-link
        to="/settings"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors shadow-xs"
      >
        <i class="ph ph-gear text-sm"></i>
        <span>Manage Custom Columns in Settings</span>
      </router-link>
    </div>

    <!-- Empty State: Column selected but no matching trades -->
    <div
      v-else-if="summary && summary.items.length === 0"
      class="text-center py-8 px-4 border border-dashed border-gray-200 rounded-xl my-4 text-gray-500 text-xs"
    >
      No trade entries recorded with attribute "{{ activeColumn?.name }}" in the current filter range.
    </div>

    <!-- Ranking Table -->
    <div v-else-if="summary" class="overflow-x-auto mt-4">
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-wider bg-gray-50/60">
            <th class="py-3 px-3 w-16 text-center">Rank</th>
            <th class="py-3 px-3">Attribute Value</th>
            <th class="py-3 px-3 text-center">Trades (% Share)</th>
            <th class="py-3 px-3 min-w-[200px]">Win / Loss Ratio</th>
            <th class="py-3 px-3 text-right">Avg RR</th>
            <th class="py-3 px-3 text-right">Net R</th>
            <th class="py-3 px-3 text-right">Profit Factor</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="(item, index) in sortedItems"
            :key="item.value"
            class="hover:bg-gray-50/70 transition-colors group"
          >
            <!-- Rank Badge -->
            <td class="py-3.5 px-3 text-center">
              <span
                v-if="index === 0 && item.totalTrades > 0"
                class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-black shadow-2xs"
                title="Top Rank"
              >
                1
              </span>
              <span
                v-else-if="index === 1 && item.totalTrades > 0"
                class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold"
              >
                2
              </span>
              <span
                v-else-if="index === 2 && item.totalTrades > 0"
                class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-800 text-xs font-bold"
              >
                3
              </span>
              <span v-else class="text-xs text-gray-400 font-mono">
                {{ index + 1 }}
              </span>
            </td>

            <!-- Value / Name -->
            <td class="py-3.5 px-3">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200/80">
                  {{ item.value }}
                </span>
                <span
                  v-if="item.isTopPerformer"
                  class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                >
                  <i class="ph-fill ph-crown text-amber-500"></i>
                  Top Win Rate
                </span>
              </div>
            </td>

            <!-- Total Trades & Share -->
            <td class="py-3.5 px-3 text-center">
              <span class="font-bold text-gray-900">{{ item.totalTrades }}</span>
              <span class="text-xs text-gray-400 ml-1">({{ item.sharePercent }}%)</span>
            </td>

            <!-- Win / Loss Visual Bar -->
            <td class="py-3.5 px-3">
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-emerald-600">
                    {{ item.winRate }}% WR
                  </span>
                  <span class="text-gray-400 text-[11px]">
                    {{ item.wins }}W · {{ item.losses }}L
                    <template v-if="item.breakEvens > 0">· {{ item.breakEvens }}BE</template>
                  </span>
                </div>

                <!-- Stacked Progress Bar -->
                <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
                  <div
                    class="bg-emerald-500 h-full transition-all duration-300"
                    :style="{ width: `${item.winRate}%` }"
                    :title="`Wins: ${item.wins} (${item.winRate}%)`"
                  ></div>
                  <div
                    class="bg-gray-400 h-full transition-all duration-300"
                    :style="{ width: `${item.breakEvenRate}%` }"
                    :title="`Break Even: ${item.breakEvens} (${item.breakEvenRate}%)`"
                  ></div>
                  <div
                    class="bg-rose-500 h-full transition-all duration-300"
                    :style="{ width: `${item.lossRate}%` }"
                    :title="`Losses: ${item.losses} (${item.lossRate}%)`"
                  ></div>
                </div>
              </div>
            </td>

            <!-- Avg RR -->
            <td class="py-3.5 px-3 text-right font-mono font-semibold">
              <span :class="item.avgRr >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                {{ item.avgRr >= 0 ? '+' : '' }}{{ item.avgRr.toFixed(2) }}R
              </span>
            </td>

            <!-- Total Net R -->
            <td class="py-3.5 px-3 text-right font-mono font-bold">
              <span :class="item.totalNetR >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                {{ item.totalNetR >= 0 ? '+' : '' }}{{ item.totalNetR.toFixed(2) }}R
              </span>
            </td>

            <!-- Profit Factor -->
            <td class="py-3.5 px-3 text-right font-mono font-semibold text-gray-700">
              <span v-if="item.profitFactor >= 99" class="text-emerald-600">MAX</span>
              <span v-else :class="item.profitFactor >= 1.5 ? 'text-emerald-600 font-bold' : item.profitFactor >= 1.0 ? 'text-gray-900' : 'text-rose-600'">
                {{ item.profitFactor.toFixed(2) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
