<template>
  <div class="p-8 w-full mx-auto bg-gray-50/50 min-h-screen">
    <!-- Header -->
    <div class="flex flex-col justify-between items-start mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-1">Winners & Losers Breakdown</h1>
        <p class="text-gray-500 text-sm">Detailed analysis of your winning vs losing trades.</p>
      </div>
    </div>

    <!-- Mode Switcher & Actions -->
    <div
      class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-wrap justify-between items-center gap-4"
    >
      <div class="flex gap-4 items-center">
        <span class="font-bold text-sm text-gray-500">RR Mode:</span>
        <BaseSelect
          v-model="statMode"
          :options="[
            { label: 'Normal RR', value: 'normal' },
            { label: 'Break Even', value: 'be' },
            { label: 'Trail + BE', value: 'trail' }
          ]"
        />
      </div>

      <router-link
        :to="{ path: '/monte-carlo', query: { mode: statMode } }"
        class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all duration-150 cursor-pointer"
        title="Run Monte Carlo simulation on these trades"
      >
        <i class="ph-bold ph-dice-five text-lg"></i>
        <span>Run Monte Carlo</span>
      </router-link>
    </div>

    <!-- Winners / Losers Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Winners Card -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
        <div class="flex items-center gap-3 mb-6">
          <div
            class="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center"
          >
            <i class="ph-bold ph-trend-up text-2xl"></i>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Winners</h2>
            <p class="text-sm text-gray-500">Summary of winning trades</p>
          </div>
        </div>

        <div class="space-y-4">
          <div
            class="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
          >
            <span class="text-sm font-semibold text-gray-500">Total Wins</span>
            <span class="font-bold text-gray-900">{{ winners.length }}</span>
          </div>
          <div
            class="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
          >
            <span class="text-sm font-semibold text-gray-500">Total Profit (RR)</span>
            <span class="font-bold text-green-600">+{{ totalWinRr.toFixed(2) }}</span>
          </div>
          <div
            class="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
          >
            <span class="text-sm font-semibold text-gray-500">Average Win (RR)</span>
            <span class="font-bold text-green-600">+{{ avgWinRr.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Losers Card -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-red-100">
        <div class="flex items-center gap-3 mb-6">
          <div
            class="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center"
          >
            <i class="ph-bold ph-trend-down text-2xl"></i>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Losers</h2>
            <p class="text-sm text-gray-500">Summary of losing trades</p>
          </div>
        </div>

        <div class="space-y-4">
          <div
            class="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
          >
            <span class="text-sm font-semibold text-gray-500">Total Losses</span>
            <span class="font-bold text-gray-900">{{ losers.length }}</span>
          </div>
          <div
            class="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
          >
            <span class="text-sm font-semibold text-gray-500">Total Loss (RR)</span>
            <span class="font-bold text-red-600">{{ totalLossRr.toFixed(2) }}</span>
          </div>
          <div
            class="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
          >
            <span class="text-sm font-semibold text-gray-500">Average Loss (RR)</span>
            <span class="font-bold text-red-600">{{ avgLossRr.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BaseSelect from '../ui/BaseSelect.vue'

const statMode = ref<'normal' | 'be' | 'trail'>('normal')
const allTrades = ref<any[]>([])

const fetchTrades = async () => {
  try {
    const res = await window.api.journal.list()
    if (res.success) {
      allTrades.value = res.data.filter((t: any) => !t.isTest)
    }
  } catch (err) {
    console.error('Failed to fetch data:', err)
  }
}

const getRr = (trade: any) => {
  if (statMode.value === 'normal') return trade.normalRr || 0
  if (statMode.value === 'be') return trade.beRr || 0
  if (statMode.value === 'trail') return trade.trailRr || 0
  return 0
}

const winners = computed(() => {
  return allTrades.value.filter((t) => getRr(t) > 0)
})

const losers = computed(() => {
  return allTrades.value.filter((t) => getRr(t) < 0)
})

const totalWinRr = computed(() => {
  return winners.value.reduce((acc, t) => acc + getRr(t), 0)
})

const avgWinRr = computed(() => {
  return winners.value.length ? totalWinRr.value / winners.value.length : 0
})

const totalLossRr = computed(() => {
  return losers.value.reduce((acc, t) => acc + getRr(t), 0)
})

const avgLossRr = computed(() => {
  return losers.value.length ? totalLossRr.value / losers.value.length : 0
})

onMounted(() => {
  fetchTrades()
})
</script>
