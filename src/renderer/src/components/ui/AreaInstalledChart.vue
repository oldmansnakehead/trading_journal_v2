<script setup lang="ts">
import { computed } from 'vue'
import BaseSelect from './BaseSelect.vue'
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
  color: string
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
    },
    {
      label: 'Europe',
      data: [8, 36, 28, 18, 40, 12, 44, 38, 44, 30, 16, 34],
      color: '#ffab00',
      total: '6.79k'
    },
    {
      label: 'Americas',
      data: [5, 18, 14, 9, 20, 6, 22, 19, 22, 15, 8, 17],
      color: '#00b8d9',
      total: '1.01k'
    }
  ]
})

const data = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((ds) => ({
    label: ds.label,
    data: ds.data,
    backgroundColor: ds.color,
    borderRadius: 4,
    barPercentage: 0.6,
    categoryPercentage: 0.4
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
      stacked: true,
      grid: { display: false, drawBorder: false },
      ticks: { color: '#637381', font: { family: "'Bai Jamjuree', sans-serif" } }
    },
    y: {
      stacked: true,
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
          <span class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: ds.color }"></span
          >{{ ds.label }}
        </div>
        <div class="text-lg font-bold text-textPrimary">{{ ds.total }}</div>
      </div>
    </div>

    <div class="flex-1 w-full relative min-h-0">
      <Bar :data="data" :options="options" />
    </div>
  </div>
</template>
