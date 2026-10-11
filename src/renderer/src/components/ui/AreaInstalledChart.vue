<script setup lang="ts">
import { computed } from 'vue'
import BaseSelect from './BaseSelect.vue'
import InfoTooltip from './InfoTooltip.vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Dataset {
  label: string
  data: number[]
  color?: string | string[]
  backgroundColor?: string | string[]
  total: string
}

interface Props {
  title?: string
  subtitle?: string
  years?: string[]
  labels?: string[]
  datasets?: Dataset[]
  infoTitle?: string
  infoDescription?: string
  infoFormula?: string
  timeframe?: string
  timeframeOptions?: { label: string; value: string }[]
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Area installed',
  subtitle: '(+43%) than last year',
  years: () => ['2023', '2022'],
  labels: () => [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ],
  datasets: () => [
    {
      label: 'Asia',
      data: [12, 54, 42, 27, 60, 18, 65, 57, 65, 45, 24, 51],
      color: '#00a76f',
      total: '1.23k'
    }
  ]
})

defineEmits<{
  (e: 'update:timeframe', value: string): void
}>()

const data = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((ds) => ({
    label: ds.label,
    data: ds.data,
    backgroundColor:
      ds.backgroundColor ||
      (Array.isArray(ds.color)
        ? ds.color
        : ds.data.map((v) => (v >= 0 ? '#00a76f' : '#ff5630'))),
    borderRadius: 4,
    barPercentage: 0.6,
    categoryPercentage: 0.6
  }))
}))

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#212B36',
      padding: 10,
      cornerRadius: 8,
      bodyFont: { family: "'Bai Jamjuree', sans-serif" },
      titleFont: { family: "'Bai Jamjuree', sans-serif" },
      callbacks: {
        label: (context: any) => {
          const val = context.raw
          return ` Net PnL: ${val >= 0 ? '+$' : '-$'}${Math.abs(val).toFixed(2)}`
        }
      }
    }
  },
  scales: {
    x: {
      stacked: false,
      grid: { display: false, drawBorder: false },
      ticks: { color: '#637381', font: { family: "'Bai Jamjuree', sans-serif" } }
    },
    y: {
      stacked: false,
      border: { dash: [4, 4] },
      grid: { color: '#f1f5f9', drawBorder: false, tickLength: 0 },
      ticks: {
        color: '#637381',
        font: { family: "'Bai Jamjuree', sans-serif" },
        padding: 10,
        callback: (value: any) => (value >= 0 ? '+$' : '-$') + Math.abs(value).toLocaleString()
      }
    }
  }
}))
</script>

<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[420px] flex flex-col min-w-0">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <div class="flex items-center gap-1.5">
          <h6 class="text-lg font-bold text-textPrimary">{{ title }}</h6>
          <InfoTooltip
            v-if="infoTitle || infoDescription"
            :title="infoTitle"
            :description="infoDescription"
            :formula="infoFormula"
          />
        </div>
        <p class="text-sm text-textSecondary">{{ subtitle }}</p>
      </div>

      <!-- Timeframe Selector -->
      <div v-if="timeframeOptions && timeframeOptions.length" class="w-48 sm:w-56 shrink-0">
        <BaseSelect
          :modelValue="timeframe || (timeframeOptions[0] ? timeframeOptions[0].value : '')"
          :options="timeframeOptions"
          @update:modelValue="$emit('update:timeframe', String($event))"
        />
      </div>
      <BaseSelect v-else-if="years && years.length > 1" :modelValue="years[0]" :options="years" />
    </div>

    <!-- Custom Legend -->
    <div class="flex flex-wrap gap-6 mb-4 px-4">
      <div v-for="ds in datasets" :key="ds.label">
        <div class="flex items-center text-xs font-semibold text-textSecondary mb-1">
          <span
            class="w-3 h-3 rounded-full mr-2"
            :style="{ backgroundColor: Array.isArray(ds.color) ? ds.color[0] : (ds.color || '#00a76f') }"
          ></span>{{ ds.label }}
        </div>
        <div class="text-lg font-bold text-textPrimary">{{ ds.total }}</div>
      </div>
    </div>

    <div class="flex-1 w-full relative min-h-0">
      <Bar :data="data" :options="options" />
    </div>
  </div>
</template>
