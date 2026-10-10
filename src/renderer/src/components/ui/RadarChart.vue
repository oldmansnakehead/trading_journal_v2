<script setup lang="ts">

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'
import { Radar } from 'vue-chartjs'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface Props {
  title?: string
  subtitle?: string
  chartData?: {
    labels: string[]
    datasets: any[]
  }
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Performance by Session',
  subtitle: 'Win Rate per session (%)',
  chartData: () => ({
    labels: ['London', 'New York', 'Asia'],
    datasets: [
      {
        label: 'Win Rate %',
        data: [65, 59, 90],
        backgroundColor: 'rgba(0, 184, 217, 0.2)',
        borderColor: '#00b8d9',
        pointBackgroundColor: '#00b8d9'
      }
    ]
  })
})

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
    r: {
      angleLines: { color: '#f1f5f9' },
      grid: { color: '#f1f5f9' },
      pointLabels: {
        color: '#637381',
        font: { family: "'Bai Jamjuree', sans-serif", size: 12, weight: 600 }
      },
      ticks: {
        display: false
      }
    }
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl p-6 shadow-card h-[400px] flex flex-col min-w-[320px]">
    <h6 class="text-lg font-bold text-textPrimary">{{ title }}</h6>
    <p class="text-sm text-textSecondary mb-6">{{ subtitle }}</p>

    <div class="flex-1 relative flex items-center justify-center min-h-0">
      <Radar :data="chartData" :options="options" />
    </div>
  </div>
</template>
