<template>
  <div class="p-8 w-full mx-auto bg-gray-50/50 min-h-screen">
    <!-- Header & Mode Switcher -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-1">Reports & Dashboard</h1>
        <p class="text-gray-500 text-sm">Analyze your trading performance and KPIs.</p>
      </div>

      <!-- Mode Switcher -->
      <div
        class="bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm flex font-semibold text-sm"
      >
        <button
          @click="statMode = 'normal'"
          :class="[
            'px-4 py-2 rounded-lg transition-colors',
            statMode === 'normal'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          ]"
        >
          Normal RR
        </button>
        <button
          @click="statMode = 'be'"
          :class="[
            'px-4 py-2 rounded-lg transition-colors',
            statMode === 'be'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          ]"
        >
          Break Even
        </button>
        <button
          @click="statMode = 'trail'"
          :class="[
            'px-4 py-2 rounded-lg transition-colors',
            statMode === 'trail'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          ]"
        >
          Trail + BE
        </button>
      </div>
    </div>

    <!-- Filters Bar -->
    <div
      class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-4 items-center"
    >
      <div class="flex items-center gap-2 text-gray-500 mr-2">
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

      <BaseSelect
        v-model="filters.setup"
        :options="[
          { label: 'All Setups', value: 'all' },
          ...setups.map((s) => ({ label: s.name, value: s.id }))
        ]"
      />

      <BaseSelect
        v-model="filters.symbol"
        :options="[
          { label: 'All Symbols', value: 'all' },
          ...symbols.map((s) => ({ label: s.name, value: s.id }))
        ]"
      />

      <BaseSelect
        v-model="filters.session"
        :options="[
          { label: 'All Sessions', value: 'all' },
          { label: 'London', value: 'london' },
          { label: 'New York', value: 'ny' },
          { label: 'Asia', value: 'asia' }
        ]"
      />

      <div class="h-6 w-px bg-gray-200 mx-2"></div>

      <div class="flex items-center gap-2">
        <label class="text-xs font-bold text-gray-500">Capital $</label>
        <input
          type="number"
          v-model="simulation.initialBalance"
          class="w-24 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-blue-500"
          placeholder="10000"
        />
      </div>

      <div class="flex items-center gap-2">
        <label class="text-xs font-bold text-gray-500">Risk %</label>
        <input
          type="number"
          step="0.1"
          v-model="simulation.riskPerTrade"
          class="w-20 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-blue-500"
          placeholder="1"
        />
      </div>

      <button
        @click="resetFilters"
        class="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors ml-auto"
      >
        Clear All
      </button>
    </div>

    <!-- KPIs Row (Cards) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <PastelStatCard
        title="Total Trades"
        :value="kpis.totalTrades"
        :trend="12"
        icon="ph-chart-bar"
        color="info"
      />
      <PastelStatCard
        title="Win Rate"
        :value="kpis.winRate + '%'"
        :trend="statMode === 'be' ? 5 : -2"
        icon="ph-check-circle"
        color="success"
      />
      <PastelStatCard
        title="Average RR"
        :value="kpis.avgRr"
        :trend="0.5"
        icon="ph-trend-up"
        color="primary"
      />
      <PastelStatCard
        title="Max Drawdown"
        :value="kpis.maxDrawdown + '%'"
        :trend="0"
        icon="ph-warning"
        color="warning"
      />
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Main Equity/PnL Curve -->
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-lg font-bold text-gray-900">Simulated Equity Curve</h2>
            <p class="text-sm text-gray-500">
              Projected balance based on {{ statMode }} mode and risk settings
            </p>
          </div>
        </div>
        <YearlySalesChart
          title="Equity Curve"
          subtitle="Simulated Balance over time"
          :labels="equityCurveData.labels"
          :datasets="equityCurveData.datasets"
          :years="['All Time']"
        />
      </div>

      <!-- Win/Loss Ratio Doughnut -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-lg font-bold text-gray-900">Trade Outcomes</h2>
            <p class="text-sm text-gray-500">Distribution of trades</p>
          </div>
        </div>
        <CurrentDownloadChart
          title="Win/Loss Ratio"
          subtitle="Based on selected RR mode"
          :total="outcomeDistribution.data.reduce((a, b) => a + b, 0)"
          :chartData="outcomeDistribution"
        />
      </div>
    </div>

    <!-- Secondary Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <AreaInstalledChart
          title="Net PnL (Daily)"
          subtitle="Simulated daily profit/loss"
          :labels="dailyPnlData.labels"
          :datasets="dailyPnlData.datasets"
          :years="['All Time']"
        />
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <RadarChart
          title="Performance by Session"
          subtitle="Win Rate per session"
          :chartData="sessionPerformance"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import PastelStatCard from '../ui/PastelStatCard.vue'
import YearlySalesChart from '../ui/YearlySalesChart.vue'
import CurrentDownloadChart from '../ui/CurrentDownloadChart.vue'
import AreaInstalledChart from '../ui/AreaInstalledChart.vue'
import RadarChart from '../ui/RadarChart.vue'
import BaseSelect from '../ui/BaseSelect.vue'

// Stat Mode: 'normal' | 'be' | 'trail'
const statMode = ref<'normal' | 'be' | 'trail'>('normal')

// Filters State
const filters = ref({
  setup: 'all',
  symbol: 'all',
  session: 'all'
})

const simulation = ref({
  initialBalance: 10000,
  riskPerTrade: 1
})

const resetFilters = () => {
  filters.value = { setup: 'all', symbol: 'all', session: 'all' }
}

const kpis = ref({
  totalTrades: 0,
  winRate: 0,
  avgRr: 0,
  maxDrawdown: 0
})

const allTrades = ref<any[]>([])
const setups = ref<{ id: number; name: string }[]>([])
const symbols = ref<{ id: number; name: string }[]>([])

// Filter trades based on selected filters
const filteredTrades = computed(() => {
  return allTrades.value.filter((t) => {
    if (
      filters.value.setup !== 'all' &&
      t.setup?.name !== filters.value.setup &&
      t.setupId?.toString() !== filters.value.setup
    )
      return false
    if (
      filters.value.symbol !== 'all' &&
      t.symbol?.name !== filters.value.symbol &&
      t.symbolId?.toString() !== filters.value.symbol
    )
      return false
    if (filters.value.session !== 'all' && t.sessionName !== filters.value.session) return false
    return true
  })
})

// Fetch KPIs and all Trades
const fetchData = async () => {
  try {
    const kpiRes = await window.api.journal.kpi(statMode.value)
    if (kpiRes.success && kpiRes.data) {
      const { totalTrades, wins, avgRr } = kpiRes.data
      const total = totalTrades || 0
      const winCount = wins || 0

      kpis.value = {
        totalTrades: total,
        winRate: total > 0 ? Number(((winCount / total) * 100).toFixed(1)) : 0,
        avgRr: avgRr ? Number(avgRr.toFixed(2)) : 0,
        maxDrawdown: 0 // Placeholder
      }
    }

    const listRes = await window.api.journal.list()
    if (listRes.success) {
      // Sort trades chronologically for the equity curve
      allTrades.value = listRes.data.sort(
        (a: any, b: any) =>
          new Date(a.entryDatetime).getTime() - new Date(b.entryDatetime).getTime()
      )
    }

    const setupsRes = await window.api.setups.list()
    if (setupsRes.success) setups.value = setupsRes.data

    const symbolsRes = await window.api.symbols.list()
    if (symbolsRes.success) symbols.value = symbolsRes.data
  } catch (err) {
    console.error('Failed to fetch data:', err)
  }
}

// Compute Equity Curve Data (Simulated)
const equityCurveData = computed(() => {
  const filtered = filteredTrades.value.filter((t) => !t.isTest) // EXCLUDE test trades for equity curve
  const labels: string[] = []
  const data: number[] = []

  let currentBalance = simulation.value.initialBalance || 10000
  const riskPercent = (simulation.value.riskPerTrade || 1) / 100

  // Calculate Drawdown
  let peak = currentBalance
  let maxDrawdown = 0

  filtered.forEach((trade) => {
    let rr = 0
    if (statMode.value === 'normal') rr = trade.normalRr || 0
    if (statMode.value === 'be') rr = trade.beRr || 0
    if (statMode.value === 'trail') rr = trade.trailRr || 0

    // Simple compounding: risk is based on current balance
    const riskAmount = currentBalance * riskPercent
    const pnl = riskAmount * rr

    currentBalance += pnl

    if (currentBalance > peak) peak = currentBalance
    const dd = ((peak - currentBalance) / peak) * 100
    if (dd > maxDrawdown) maxDrawdown = dd

    labels.push(new Date(trade.entryDatetime).toLocaleDateString())
    data.push(Number(currentBalance.toFixed(2)))
  })

  // Update DD KPI
  kpis.value.maxDrawdown = Number(maxDrawdown.toFixed(2))

  return {
    labels: labels.length > 0 ? labels : ['No Data'],
    datasets: [
      {
        label: 'Balance ($)',
        data: data.length > 0 ? data : [simulation.value.initialBalance],
        borderColor: '#00a76f',
        backgroundColor: 'rgba(0, 167, 111, 0.1)',
        total: '$' + currentBalance.toFixed(2)
      }
    ]
  }
})

// Compute Daily PnL
const dailyPnlData = computed(() => {
  const filtered = filteredTrades.value.filter((t) => !t.isTest)
  const dailyPnl: Record<string, number> = {}

  let currentBalance = simulation.value.initialBalance || 10000
  const riskPercent = (simulation.value.riskPerTrade || 1) / 100

  filtered.forEach((trade) => {
    let rr = 0
    if (statMode.value === 'normal') rr = trade.normalRr || 0
    if (statMode.value === 'be') rr = trade.beRr || 0
    if (statMode.value === 'trail') rr = trade.trailRr || 0

    const riskAmount = currentBalance * riskPercent
    const pnl = riskAmount * rr
    currentBalance += pnl

    const dateKey = new Date(trade.entryDatetime).toLocaleDateString()
    if (!dailyPnl[dateKey]) dailyPnl[dateKey] = 0
    dailyPnl[dateKey] += pnl
  })

  const labels = Object.keys(dailyPnl)
  const data = Object.values(dailyPnl).map((v) => Number(v.toFixed(2)))

  return {
    labels: labels.length > 0 ? labels : ['No Data'],
    datasets: [
      {
        label: 'Net PnL',
        data: data.length > 0 ? data : [0],
        color: '#ffab00',
        total: '$' + data.reduce((a, b) => a + b, 0).toFixed(2)
      }
    ]
  }
})

// Compute Win/Loss Distribution
const outcomeDistribution = computed(() => {
  const filtered = filteredTrades.value.filter((t) => !t.isTest)
  let wins = 0
  let losses = 0
  let breakEvens = 0

  filtered.forEach((trade) => {
    let rr = 0
    if (statMode.value === 'normal') rr = trade.normalRr || 0
    if (statMode.value === 'be') rr = trade.beRr || 0
    if (statMode.value === 'trail') rr = trade.trailRr || 0

    if (rr > 0) wins++
    else if (rr < 0) losses++
    else breakEvens++
  })

  return {
    labels: ['Wins', 'Losses', 'Break Evens'],
    data: [wins, losses, breakEvens],
    colors: ['#00a76f', '#ff5630', '#ffab00']
  }
})

// Session Performance Radar
const sessionPerformance = computed(() => {
  const filtered = filteredTrades.value.filter((t) => !t.isTest)
  const sessionStats: Record<string, { wins: number; total: number }> = {}

  filtered.forEach((trade) => {
    let rr = 0
    if (statMode.value === 'normal') rr = trade.normalRr || 0
    if (statMode.value === 'be') rr = trade.beRr || 0
    if (statMode.value === 'trail') rr = trade.trailRr || 0

    const session = trade.sessionName || 'Unknown'
    if (!sessionStats[session]) sessionStats[session] = { wins: 0, total: 0 }

    sessionStats[session].total++
    if (rr > 0) sessionStats[session].wins++
  })

  const labels = Object.keys(sessionStats)
  const data = labels.map((l) => {
    const stat = sessionStats[l]
    return stat.total > 0 ? Number(((stat.wins / stat.total) * 100).toFixed(1)) : 0
  })

  return {
    labels: labels.length > 0 ? labels : ['No Data'],
    datasets: [
      {
        label: 'Win Rate %',
        data: data.length > 0 ? data : [0],
        backgroundColor: 'rgba(0, 184, 217, 0.2)',
        borderColor: '#00b8d9',
        pointBackgroundColor: '#00b8d9'
      }
    ]
  }
})

watch(statMode, () => {
  fetchData()
})

onMounted(() => {
  fetchData()
})
</script>
