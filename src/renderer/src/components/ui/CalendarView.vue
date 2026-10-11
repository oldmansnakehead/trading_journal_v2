<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BaseSelect from './BaseSelect.vue'
import TradeDetailsModal from './TradeDetailsModal.vue'
import InfoTooltip from './InfoTooltip.vue'

const currentDate = ref(new Date())

// Trade and Setup data from DB
const trades = ref<any[]>([])
const setups = ref<{ id: number; name: string }[]>([])

// Filter State: Setup & RR Type & Trade Type
const selectedSetup = ref<string>('all')
const rrType = ref<'normal' | 'be' | 'trail'>('normal')
const tradeType = ref<'all' | 'real' | 'test'>('all')

// Capital & Risk % Simulation & Return Calculation (Simple vs Log Compounded)
const simulation = ref({
  initialBalance: 10000,
  riskPerTrade: 1,
  returnCalculation: 'simple' as 'simple' | 'log'
})

const setupOptions = computed(() => [
  { label: 'All Setups', value: 'all' },
  ...setups.value.map((s) => ({ label: s.name, value: String(s.id) }))
])

const tradeTypeOptions = [
  { label: 'All Trades', value: 'all' },
  { label: 'Real Trades', value: 'real' },
  { label: 'Paper / Test', value: 'test' }
]

// Day Details & Trade Modal State
const selectedDayDate = ref<string | null>(null)
const showDayModal = ref(false)
const selectedTradeId = ref<number | null>(null)
const showTradeDetails = ref(false)

// Helper to calculate RR according to selected RR mode with safe fallbacks
const getTradeRr = (trade: any, mode: 'normal' | 'be' | 'trail' = rrType.value): number => {
  if (mode === 'normal') return Number(trade.normalRr ?? 0)
  if (mode === 'be') return Number(trade.beRr ?? trade.normalRr ?? 0)
  if (mode === 'trail') return Number(trade.trailRr ?? trade.normalRr ?? 0)
  return 0
}

// Local date string helper (YYYY-MM-DD) avoiding UTC shifts
const formatLocalDate = (d: Date): string => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isToday = (dayDateStr: string) => {
  return dayDateStr === formatLocalDate(new Date())
}

const fetchData = async () => {
  try {
    if (window.api?.journal?.list) {
      const res = await window.api.journal.list()
      if (res.success) {
        trades.value = res.data
      }
    }
    if (window.api?.setups?.list) {
      const setupsRes = await window.api.setups.list()
      if (setupsRes.success) {
        setups.value = setupsRes.data
      }
    }
  } catch (err) {
    console.error('Failed to fetch calendar data:', err)
  }
}

// Filtered trades based on selected Setup and Trade Type
const filteredTrades = computed(() => {
  return trades.value.filter((t) => {
    // Setup filter
    if (selectedSetup.value !== 'all' && t.setupId?.toString() !== String(selectedSetup.value)) {
      return false
    }

    // Trade Type filter
    if (tradeType.value === 'real' && t.isTest) return false
    if (tradeType.value === 'test' && !t.isTest) return false

    return true
  })
})

// Chronologically sorted filtered trades for accurate compounding calculation
const sortedFilteredTrades = computed(() => {
  return [...filteredTrades.value].sort(
    (a, b) => new Date(a.entryDatetime).getTime() - new Date(b.entryDatetime).getTime()
  )
})

export interface DayStat {
  dateStr: string
  date: Date
  count: number
  netRr: number
  netPnl: number
  wins: number
  losses: number
  beCount: number
  trades: any[]
}

// Compute daily aggregated data based on filtered trades & current RR type & simulation settings
const dailyStats = computed(() => {
  const stats: Record<string, DayStat> = {}
  const isSimple = simulation.value.returnCalculation === 'simple'
  const initialBalance = Number(simulation.value.initialBalance) || 10000
  const riskPercent = (Number(simulation.value.riskPerTrade) || 1) / 100
  const fixedRiskAmount = initialBalance * riskPercent

  let currentBalance = initialBalance

  sortedFilteredTrades.value.forEach((trade) => {
    if (!trade.entryDatetime) return
    const tradeDate = new Date(trade.entryDatetime)
    const dateStr = formatLocalDate(tradeDate)

    if (!stats[dateStr]) {
      stats[dateStr] = {
        dateStr,
        date: tradeDate,
        count: 0,
        netRr: 0,
        netPnl: 0,
        wins: 0,
        losses: 0,
        beCount: 0,
        trades: []
      }
    }

    const rr = getTradeRr(trade, rrType.value)
    const riskAmount = isSimple ? fixedRiskAmount : currentBalance * riskPercent
    const pnl = riskAmount * rr
    currentBalance += pnl

    stats[dateStr].count++
    stats[dateStr].netRr += rr
    stats[dateStr].netPnl += pnl
    stats[dateStr].trades.push({
      ...trade,
      simulatedPnl: pnl,
      simulatedRr: rr
    })

    if (rr > 0) stats[dateStr].wins++
    else if (rr < 0) stats[dateStr].losses++
    else stats[dateStr].beCount++
  })

  return stats
})

// Monthly KPI Summary for the currently viewed month
const monthlySummary = computed(() => {
  const targetYear = currentDate.value.getFullYear()
  const targetMonth = currentDate.value.getMonth()

  let totalTrades = 0
  let wins = 0
  let losses = 0
  let beCount = 0
  let netRr = 0
  let netPnl = 0
  let winDays = 0
  let lossDays = 0
  let beDays = 0

  Object.values(dailyStats.value).forEach((day) => {
    const d = new Date(day.dateStr + 'T00:00:00')
    if (d.getFullYear() === targetYear && d.getMonth() === targetMonth) {
      totalTrades += day.count
      wins += day.wins
      losses += day.losses
      beCount += day.beCount
      netRr += day.netRr
      netPnl += day.netPnl

      if (day.netPnl > 0) winDays++
      else if (day.netPnl < 0) lossDays++
      else if (day.count > 0) beDays++
    }
  })

  const winRate = totalTrades > 0 ? Number(((wins / totalTrades) * 100).toFixed(1)) : 0

  return {
    totalTrades,
    wins,
    losses,
    beCount,
    netRr: Number(netRr.toFixed(2)),
    netPnl: Number(netPnl.toFixed(2)),
    winRate,
    winDays,
    lossDays,
    beDays
  }
})

// Generate Calendar Days (Monday to Sunday grid)
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  let startingDayIndex = firstDay.getDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
  // Convert to Mon=0, Sun=6
  startingDayIndex = startingDayIndex === 0 ? 6 : startingDayIndex - 1

  const days: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = []

  // Previous month days
  const prevMonth = new Date(year, month, 0)
  for (let i = startingDayIndex - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonth.getDate() - i)
    days.push({
      date: d,
      isCurrentMonth: false,
      dateStr: formatLocalDate(d)
    })
  }

  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i)
    days.push({
      date: d,
      isCurrentMonth: true,
      dateStr: formatLocalDate(d)
    })
  }

  // Next month days to complete grid (42 cells max)
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({
      date: d,
      isCurrentMonth: false,
      dateStr: formatLocalDate(d)
    })
  }

  return days
})

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const setToday = () => {
  currentDate.value = new Date()
}

const handleDayClick = (day: { dateStr: string; isCurrentMonth: boolean }) => {
  if (dailyStats.value[day.dateStr]?.count) {
    selectedDayDate.value = day.dateStr
    showDayModal.value = true
  }
}

const selectedDayStat = computed(() => {
  if (!selectedDayDate.value) return null
  return dailyStats.value[selectedDayDate.value] || null
})

const openTradeDetails = (id: number) => {
  selectedTradeId.value = id
  showTradeDetails.value = true
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Header Controls -->
    <div class="p-6 border-b border-gray-100 flex flex-col gap-4">
      <!-- Top Row: Title & Month Navigation -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Trading Calendar</h1>
          <p class="text-xs sm:text-sm text-gray-500">Track and review your daily trading performance & RR.</p>
        </div>

        <!-- Month Navigation & Today -->
        <div class="flex items-center gap-2 self-start sm:self-center">
          <button
            @click="prevMonth"
            class="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Previous Month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span class="text-base sm:text-lg font-bold text-gray-900 min-w-[160px] text-center select-none">
            {{ currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }) }}
          </span>
          <button
            @click="nextMonth"
            class="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Next Month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          <button
            @click="setToday"
            class="ml-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>
      </div>

      <!-- Controls Row: Simulation Inputs (Capital, Risk%, Return Calculation), Setup, Trade Type, and RR Mode Switcher -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
        <!-- Left Group: Capital, Risk%, Return Calculation, Setup, Trade Type -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Capital $ -->
          <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <label class="text-xs font-bold text-gray-500">Capital $</label>
            <input
              type="number"
              min="0"
              v-model.number="simulation.initialBalance"
              class="w-24 bg-transparent text-gray-900 text-xs sm:text-sm font-semibold outline-none text-right"
              placeholder="10000"
            />
          </div>

          <!-- Risk % -->
          <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <label class="text-xs font-bold text-gray-500">Risk %</label>
            <input
              type="number"
              min="0"
              step="0.1"
              v-model.number="simulation.riskPerTrade"
              class="w-16 bg-transparent text-gray-900 text-xs sm:text-sm font-semibold outline-none text-right"
              placeholder="1"
            />
          </div>

          <!-- Return Calculation (Simple vs Log Compounded) -->
          <div class="flex flex-col gap-0.5">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Return Calculation</span>
            <div class="bg-gray-100 p-0.5 rounded-xl flex font-semibold text-xs border border-gray-200/60 shadow-2xs">
              <button
                type="button"
                @click="simulation.returnCalculation = 'simple'"
                :class="[
                  'px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer',
                  simulation.returnCalculation === 'simple'
                    ? 'bg-white text-gray-900 shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-800'
                ]"
              >
                Simple
              </button>
              <button
                type="button"
                @click="simulation.returnCalculation = 'log'"
                :class="[
                  'px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer',
                  simulation.returnCalculation === 'log'
                    ? 'bg-white text-gray-900 shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-800'
                ]"
              >
                Log (Compounded)
              </button>
            </div>
          </div>

          <!-- Setup Filter -->
          <div class="w-40">
            <BaseSelect
              v-model="selectedSetup"
              :options="setupOptions"
              placeholder="All Setups"
            />
          </div>

          <!-- Trade Type Filter -->
          <div class="w-32">
            <BaseSelect
              v-model="tradeType"
              :options="tradeTypeOptions"
              placeholder="All Trades"
            />
          </div>
        </div>

        <!-- Right Group: RR Mode Switcher -->
        <div class="bg-gray-100 p-1 rounded-xl flex font-semibold text-xs border border-gray-200 shadow-2xs">
          <button
            @click="rrType = 'normal'"
            :class="[
              'px-3 py-1.5 rounded-lg transition-colors cursor-pointer',
              rrType === 'normal'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Normal RR
          </button>
          <button
            @click="rrType = 'be'"
            :class="[
              'px-3 py-1.5 rounded-lg transition-colors cursor-pointer',
              rrType === 'be'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Break Even
          </button>
          <button
            @click="rrType = 'trail'"
            :class="[
              'px-3 py-1.5 rounded-lg transition-colors cursor-pointer',
              rrType === 'trail'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Trail + BE
          </button>
        </div>
      </div>

      <!-- Monthly Summary KPI Bar -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <!-- Monthly Net PnL & Net RR -->
        <div class="bg-gray-50/80 rounded-xl p-3 border border-gray-100 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-1.5">
              <p class="text-xs text-gray-500 font-medium">Monthly Net PnL</p>
              <InfoTooltip
                title="Monthly Net PnL (กำไรสุทธิประจำเดือน)"
                description="ผลรวมกำไรหรือขาดทุนสุทธิของเดือนนี้จากการเทรดทั้งหมดตามเงื่อนไขที่เลือก (Capital, Risk %, Return Calculation)"
                formula="ผลรวม PnL ($) หรือ R ในเดือนนี้"
              />
            </div>
            <p
              class="text-lg font-bold"
              :class="monthlySummary.netPnl > 0 ? 'text-emerald-600' : monthlySummary.netPnl < 0 ? 'text-rose-600' : 'text-gray-700'"
            >
              {{ monthlySummary.netPnl >= 0 ? '+' : '' }}${{ monthlySummary.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </p>
            <p class="text-[11px] font-semibold text-gray-500">
              {{ monthlySummary.netRr > 0 ? '+' : '' }}{{ monthlySummary.netRr }} R [{{ simulation.returnCalculation === 'simple' ? 'SIMPLE' : 'LOG' }}]
            </p>
          </div>
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            :class="monthlySummary.netPnl >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'"
          >
            <i :class="monthlySummary.netPnl >= 0 ? 'ph ph-trend-up' : 'ph ph-trend-down'"></i>
          </div>
        </div>

        <!-- Monthly Win Rate -->
        <div class="bg-gray-50/80 rounded-xl p-3 border border-gray-100 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-1.5">
              <p class="text-xs text-gray-500 font-medium">Win Rate</p>
              <InfoTooltip
                title="Monthly Win Rate (อัตราการชนะรายเดือน)"
                description="สัดส่วนเปอร์เซ็นต์ของจำนวนไม้ที่ชนะเทียบกับไม้ทั้งหมดในเดือนนี้"
                formula="(จำนวนไม้ชนะ ÷ จำนวนไม้ทั้งหมด) × 100%"
              />
            </div>
            <p class="text-lg font-bold text-gray-900">{{ monthlySummary.winRate }}%</p>
            <p class="text-[11px] text-gray-500">{{ monthlySummary.wins }} wins / {{ monthlySummary.losses }} losses</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl shrink-0">
            <i class="ph ph-chart-pie-slice"></i>
          </div>
        </div>

        <!-- Total Trades -->
        <div class="bg-gray-50/80 rounded-xl p-3 border border-gray-100 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-1.5">
              <p class="text-xs text-gray-500 font-medium">Total Trades</p>
              <InfoTooltip
                title="Total Trades (จำนวนไม้ทั้งหมดในเดือน)"
                description="จำนวนออเดอร์ทั้งหมดที่เปิดในเดือนนี้ เพื่อดูความถี่และวินัยในการเทรด"
                formula="นับจำนวนรายการออเดอร์ในเดือน"
              />
            </div>
            <p class="text-lg font-bold text-gray-900">
              {{ monthlySummary.totalTrades }}
            </p>
            <p class="text-[11px] text-gray-500">{{ monthlySummary.beCount }} Break Even</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl shrink-0">
            <i class="ph ph-receipt"></i>
          </div>
        </div>

        <!-- Trading Days -->
        <div class="bg-gray-50/80 rounded-xl p-3 border border-gray-100 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-1.5">
              <p class="text-xs text-gray-500 font-medium">Trading Days</p>
              <InfoTooltip
                title="Trading Days (วันที่เทรดในเดือน)"
                description="จำนวนวันที่ได้กำไร (Win Days) เทียบกับวันที่ขาดทุน (Loss Days) ในเดือนนี้ ช่วยดูความสม่ำเสมอในแต่ละวัน"
                formula="นับจำนวนวันที่มี Net PnL เป็นบวก (W) หรือเป็นลบ (L)"
              />
            </div>
            <p class="text-lg font-bold text-gray-900">
              <span class="text-emerald-600">{{ monthlySummary.winDays }}W</span> · <span class="text-rose-600">{{ monthlySummary.lossDays }}L</span>
            </p>
            <p class="text-[11px] text-gray-500">{{ monthlySummary.beDays }} Break Even days</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl shrink-0">
            <i class="ph ph-calendar-check"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="flex-1 p-6 overflow-x-auto bg-gray-50/50">
      <div class="min-w-[800px] h-full flex flex-col">
        <!-- Days Header -->
        <div class="grid grid-cols-7 border-b border-gray-200 pb-2 shrink-0">
          <div class="text-center text-sm font-semibold text-gray-500">Mon</div>
          <div class="text-center text-sm font-semibold text-gray-500">Tue</div>
          <div class="text-center text-sm font-semibold text-gray-500">Wed</div>
          <div class="text-center text-sm font-semibold text-gray-500">Thu</div>
          <div class="text-center text-sm font-semibold text-gray-500">Fri</div>
          <div class="text-center text-sm font-semibold text-gray-500">Sat</div>
          <div class="text-center text-sm font-semibold text-gray-500">Sun</div>
        </div>

        <!-- Dates Grid -->
        <div
          class="grid grid-cols-7 border-l border-t border-gray-200 mt-2 bg-gray-200 gap-px flex-1 rounded-xl overflow-hidden shadow-xs"
        >
          <div
            v-for="(day, idx) in calendarDays"
            :key="idx"
            @click="handleDayClick(day)"
            class="bg-white min-h-[110px] p-2.5 relative flex flex-col transition-all duration-150 group"
            :class="[
              dailyStats[day.dateStr]?.count ? 'cursor-pointer hover:bg-blue-50/40' : 'hover:bg-gray-50/60',
              !day.isCurrentMonth ? 'bg-gray-50/40 text-gray-400' : ''
            ]"
          >
            <!-- Date Number & Today Indicator -->
            <div class="flex items-center justify-between mb-1">
              <span
                v-if="isToday(day.dateStr)"
                class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white"
              >
                Today
              </span>
              <span v-else></span>
              <span
                class="text-xs font-semibold"
                :class="[
                  isToday(day.dateStr) ? 'text-blue-600 font-bold' : '',
                  day.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                ]"
              >
                {{ day.date.getDate() }}
              </span>
            </div>

            <!-- Daily Stats -->
            <div v-if="dailyStats[day.dateStr]" class="flex flex-col gap-1 w-full mt-auto">
              <!-- Trade count & Win/Loss dots -->
              <div class="flex items-center justify-between text-[11px] font-semibold text-gray-500 px-0.5">
                <span>{{ dailyStats[day.dateStr].count }} {{ dailyStats[day.dateStr].count === 1 ? 'trade' : 'trades' }}</span>
                <!-- Mini dots -->
                <div class="flex items-center gap-0.5">
                  <span
                    v-for="(tr, tIdx) in dailyStats[day.dateStr].trades.slice(0, 5)"
                    :key="tIdx"
                    class="w-1.5 h-1.5 rounded-full"
                    :class="getTradeRr(tr, rrType) > 0 ? 'bg-emerald-500' : getTradeRr(tr, rrType) < 0 ? 'bg-rose-500' : 'bg-gray-400'"
                  ></span>
                  <span v-if="dailyStats[day.dateStr].trades.length > 5" class="text-[9px] text-gray-400">+{{ dailyStats[day.dateStr].trades.length - 5 }}</span>
                </div>
              </div>

              <!-- Daily Net PnL & RR Badge -->
              <div
                class="text-xs px-2 py-1 rounded-lg truncate font-bold text-center border shadow-2xs transition-transform group-hover:scale-[1.02]"
                :class="[
                  dailyStats[day.dateStr].netPnl > 0
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : dailyStats[day.dateStr].netPnl < 0
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                ]"
              >
                <div>
                  {{ dailyStats[day.dateStr].netPnl >= 0 ? '+' : '' }}${{ dailyStats[day.dateStr].netPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </div>
                <div class="text-[10px] opacity-75 font-semibold">
                  {{ dailyStats[day.dateStr].netRr > 0 ? '+' : '' }}{{ dailyStats[day.dateStr].netRr.toFixed(2) }} R
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Day Trades Modal -->
    <div
      v-if="showDayModal && selectedDayStat"
      @click.self="showDayModal = false"
      class="fixed inset-0 z-[90] flex items-center justify-center bg-gray-900/40 backdrop-blur-2xs p-4"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
        <!-- Modal Header -->
        <div class="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-lg text-gray-900">
              Trades on {{ new Date(selectedDayStat.dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
            </h3>
            <p class="text-xs text-gray-500">
              Total {{ selectedDayStat.count }} trades · Net PnL: 
              <span
                class="font-bold"
                :class="selectedDayStat.netPnl > 0 ? 'text-emerald-600' : selectedDayStat.netPnl < 0 ? 'text-rose-600' : 'text-gray-700'"
              >
                {{ selectedDayStat.netPnl >= 0 ? '+' : '' }}${{ selectedDayStat.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                ({{ selectedDayStat.netRr > 0 ? '+' : '' }}{{ selectedDayStat.netRr.toFixed(2) }} R)
              </span>
              [{{ rrType.toUpperCase() }} - {{ simulation.returnCalculation === 'simple' ? 'SIMPLE' : 'LOG' }}]
            </p>
          </div>
          <button
            @click="showDayModal = false"
            class="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Modal Trades List -->
        <div class="p-5 overflow-y-auto space-y-2.5 max-h-[60vh] bg-gray-50/50">
          <div
            v-for="t in selectedDayStat.trades"
            :key="t.id"
            @click="openTradeDetails(t.id)"
            class="p-3.5 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs"
                :class="t.position?.toLowerCase() === 'buy' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'"
              >
                {{ t.position ? t.position.toUpperCase() : 'TRADE' }}
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="font-bold text-sm text-gray-900">{{ t.symbolName || 'Unknown' }}</span>
                  <span v-if="t.setupName" class="text-xs text-gray-500">· {{ t.setupName }}</span>
                  <span
                    v-if="t.isTest"
                    class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700"
                  >
                    Paper
                  </span>
                </div>
                <p class="text-xs text-gray-400">
                  {{ new Date(t.entryDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                  <span v-if="t.sessionName">· {{ t.sessionName }}</span>
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="text-right">
                <span
                  class="px-2.5 py-1 rounded-lg text-xs font-bold inline-block"
                  :class="[
                    (t.simulatedPnl ?? 0) > 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : (t.simulatedPnl ?? 0) < 0
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                  ]"
                >
                  {{ (t.simulatedPnl ?? 0) >= 0 ? '+' : '' }}${{ (t.simulatedPnl ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </span>
                <div class="text-[10px] text-gray-500 font-semibold mt-0.5">
                  {{ (t.simulatedRr ?? getTradeRr(t, rrType)) > 0 ? '+' : '' }}{{ (t.simulatedRr ?? getTradeRr(t, rrType)).toFixed(2) }} R
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trade Details Modal -->
    <TradeDetailsModal
      v-model:show="showTradeDetails"
      :tradeId="selectedTradeId"
    />
  </div>
</template>
