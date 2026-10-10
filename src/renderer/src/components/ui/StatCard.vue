<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: string | number
  trend?: number
  trendLabel?: string
  chartColor?: 'primary' | 'info' | 'error' | 'success' | 'warning'
  chartData?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  trend: 0,
  trendLabel: 'last 7 days',
  chartColor: 'success',
  chartData: () => [30, 70, 50, 100, 80]
})

const trendClass = computed(() => {
  if (props.trend > 0) return 'text-success-dark bg-success/20'
  if (props.trend < 0) return 'text-error-dark bg-error/20'
  return 'text-gray-500 bg-gray-100'
})

const trendIcon = computed(() => {
  if (props.trend > 0) return 'ph-trend-up'
  if (props.trend < 0) return 'ph-trend-down'
  return 'ph-minus'
})

const trendFormatted = computed(() => {
  if (props.trend > 0) return `+${props.trend}%`
  return `${props.trend}%`
})

const chartColorClass = computed(() => {
  const map: Record<string, string> = {
    primary: 'bg-primary',
    info: 'bg-info',
    error: 'bg-error',
    success: 'bg-success',
    warning: 'bg-warning'
  }
  return map[props.chartColor] || 'bg-success'
})

const normalizedChartData = computed(() => {
  if (!props.chartData || props.chartData.length === 0) return []
  const max = Math.max(...props.chartData)
  if (max === 0) return props.chartData.map(() => 0)
  return props.chartData.map((v) => (v / max) * 100)
})
</script>

<template>
  <div
    class="bg-white rounded-2xl p-6 shadow-card flex items-center justify-between relative overflow-hidden"
  >
    <div>
      <h6 class="text-sm font-semibold text-textSecondary mb-2">{{ title }}</h6>
      <h3 class="text-3xl font-bold mb-2 text-textPrimary">{{ value }}</h3>
      <div class="flex items-center text-sm font-medium gap-2">
        <div class="flex items-center px-1.5 py-0.5 rounded font-bold" :class="trendClass">
          <i class="ph mr-1 font-bold" :class="trendIcon"></i> {{ trendFormatted }}
        </div>
        <span class="text-textSecondary">{{ trendLabel }}</span>
      </div>
    </div>

    <!-- Sparkline Chart -->
    <div class="w-16 h-12 opacity-50">
      <div class="flex items-end justify-between h-full w-full gap-1">
        <div
          v-for="(height, index) in normalizedChartData"
          :key="index"
          :class="chartColorClass"
          class="flex-1 rounded-t-sm"
          :style="{ height: `${height}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>
