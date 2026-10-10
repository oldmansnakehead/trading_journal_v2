<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const currentDate = ref(new Date())

// Trade data from DB
const trades = ref<any[]>([])

const fetchTrades = async () => {
  try {
    const res = await window.api.journal.list()
    if (res.success) {
      trades.value = res.data
    }
  } catch (err) {
    console.error('Failed to fetch calendar trades:', err)
  }
}

// Compute daily aggregated data
// e.g. { '2026-10-10': { pnl: 50, count: 2, isWin: true } }
const dailyStats = computed(() => {
  const stats: Record<string, { pnl: number; count: number }> = {}
  // Assuming a constant risk for simplicity or normalRr sum
  const riskAmount = 100 // Mock 100$ risk to calculate PnL

  trades.value.forEach((trade) => {
    if (trade.isTest) return
    const dateStr = new Date(trade.entryDatetime).toISOString().split('T')[0]
    if (!stats[dateStr]) stats[dateStr] = { pnl: 0, count: 0 }

    stats[dateStr].count++
    stats[dateStr].pnl += (trade.normalRr || 0) * riskAmount
  })

  return stats
})

// Generate Calendar Days
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
      dateStr: d.toISOString().split('T')[0]
    })
  }

  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i)
    // Offset for local timezone if needed, but this is simple enough
    const dLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    days.push({
      date: d,
      isCurrentMonth: true,
      dateStr: dLocal.toISOString().split('T')[0]
    })
  }

  // Next month days to complete grid (42 cells max)
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    const dLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    days.push({
      date: d,
      isCurrentMonth: false,
      dateStr: dLocal.toISOString().split('T')[0]
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

onMounted(() => {
  fetchTrades()
})
</script>

<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Header Controls -->
    <div class="flex items-center justify-between p-4 border-b border-gray-100">
      <div class="flex items-center gap-2">
        <h2 class="text-xl font-bold text-gray-900 mr-4">Calendar</h2>
        <!-- View mode toggles -->
        <button
          class="bg-gray-100 text-gray-700 py-1.5 px-3 rounded-lg text-sm font-semibold hover:bg-gray-200"
        >
          Monthly
        </button>
      </div>

      <!-- Month Navigation -->
      <div class="flex items-center gap-4">
        <button @click="prevMonth" class="text-gray-400 hover:text-gray-900 p-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <h3 class="text-lg font-bold text-gray-900 w-40 text-center">
          {{ currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }) }}
        </h3>
        <button @click="nextMonth" class="text-gray-400 hover:text-gray-900 p-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-3">
        <button
          @click="setToday"
          class="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-1.5 rounded-lg font-bold text-sm transition-colors"
        >
          Today
        </button>
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
          class="grid grid-cols-7 border-l border-t border-gray-200 mt-2 bg-gray-200 gap-px flex-1 rounded-lg overflow-hidden"
        >
          <div
            v-for="(day, idx) in calendarDays"
            :key="idx"
            class="bg-white min-h-[120px] p-2 relative flex flex-col transition-colors hover:bg-gray-50"
          >
            <!-- Date Number -->
            <span
              class="text-sm font-medium self-end mb-2"
              :class="day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'"
            >
              {{ day.date.getDate() }}
            </span>

            <!-- Daily Stats -->
            <div v-if="dailyStats[day.dateStr]" class="flex flex-col gap-1 w-full mt-auto">
              <!-- Trade Count -->
              <div class="text-[10px] font-semibold text-gray-400 px-1">
                {{ dailyStats[day.dateStr].count }} trades
              </div>

              <!-- PnL Badge -->
              <div
                class="text-xs px-2 py-1 rounded truncate font-medium text-center"
                :class="
                  dailyStats[day.dateStr].pnl >= 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                "
              >
                {{ dailyStats[day.dateStr].pnl >= 0 ? '+' : '' }}${{
                  dailyStats[day.dateStr].pnl.toFixed(2)
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
