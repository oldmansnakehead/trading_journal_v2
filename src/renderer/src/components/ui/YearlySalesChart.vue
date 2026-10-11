<script setup lang="ts">
import { computed } from 'vue'
import BaseSelect from './BaseSelect.vue'
import InfoTooltip from './InfoTooltip.vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Dataset {
  label: string
  data: number[]
  borderColor: string
  backgroundColor: string
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
  title: 'Yearly sales',
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
      label: 'Total income',
      data: [40, 30, 50, 40, 80, 70, 90, 110, 70, 90, 80, 70],
      borderColor: '#00a76f',
      backgroundColor: 'rgba(0, 167, 111, 0.1)',
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
    borderColor: ds.borderColor,
    backgroundColor: ds.backgroundColor,
    fill: true,
    tension: 0.3,
    borderWidth: 2.5,
    pointRadius: props.labels && props.labels.length > 50 ? 0 : 3,
    pointHoverRadius: 6,
    pointBackgroundColor: '#fff',
    pointBorderColor: ds.borderColor,
    pointBorderWidth: 2
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
          return ` Balance: $${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }
      }
    }
  },
  scales: {
    x: {
      grid: { display: false, drawBorder: false },
      ticks: {
        color: '#637381',
        font: { family: "'Bai Jamjuree', sans-serif" },
        maxRotation: 45,
        autoSkip: true,
        maxTicksLimit: 15
      }
    },
    y: {
      border: { dash: [4, 4] },
      grid: { color: '#f1f5f9', drawBorder: false, tickLength: 0 },
      ticks: {
        color: '#637381',
        font: { family: "'Bai Jamjuree', sans-serif" },
        padding: 10,
        callback: (value: any) => '$' + Number(value).toLocaleString()
      }
    }
  }
}))
</script>

<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[460px] flex flex-col min-w-0">
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
            :style="{ backgroundColor: ds.borderColor }"
          ></span
          >{{ ds.label }}
        </div>
        <div class="text-lg font-bold text-textPrimary">{{ ds.total }}</div>
      </div>
    </div>

    <div class="flex-1 w-full relative min-h-0">
      <Line :data="data" :options="options" />
    </div>
  </div>
</template>
