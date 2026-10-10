<script setup lang="ts">
import { computed } from 'vue'
import BaseSelect from './BaseSelect.vue'
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
    },
    {
      label: 'Total expenses',
      data: [50, 20, 30, 20, 70, 90, 60, 80, 80, 60, 50, 40],
      borderColor: '#ffab00',
      backgroundColor: 'rgba(255, 171, 0, 0.1)',
      total: '6.79k'
    }
  ]
})

const data = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((ds) => ({
    label: ds.label,
    data: ds.data,
    borderColor: ds.borderColor,
    backgroundColor: ds.backgroundColor,
    fill: true,
    tension: 0.4,
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 6,
    pointBackgroundColor: '#fff',
    pointBorderColor: ds.borderColor,
    pointBorderWidth: 2
  }))
}))

const options = {
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
      titleFont: { family: "'Bai Jamjuree', sans-serif" }
    }
  },
  scales: {
    x: {
      grid: { display: false, drawBorder: false },
      ticks: { color: '#637381', font: { family: "'Bai Jamjuree', sans-serif" } }
    },
    y: {
      border: { dash: [4, 4] },
      grid: { color: '#f1f5f9', drawBorder: false, tickLength: 0 },
      ticks: { color: '#637381', font: { family: "'Bai Jamjuree', sans-serif" }, padding: 10 }
    }
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl p-6 shadow-card h-[400px] flex flex-col min-w-[500px]">
    <div class="flex justify-between items-start mb-6">
      <div>
        <h6 class="text-lg font-bold text-textPrimary">{{ title }}</h6>
        <p class="text-sm text-textSecondary">{{ subtitle }}</p>
      </div>
      <BaseSelect :modelValue="years[0]" :options="years" />
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
