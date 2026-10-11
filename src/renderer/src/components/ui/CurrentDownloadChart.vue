<script setup lang="ts">
import { computed } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  title?: string
  subtitle?: string
  total?: string | number
  chartData?: {
    labels: string[]
    data: number[]
    colors: string[]
  }
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  total: '0',
  chartData: () => ({
    labels: ['Mac', 'Window', 'iOS', 'Android'],
    data: [40, 25, 20, 15],
    colors: ['#00a76f', '#5be49b', '#007867', '#212B36']
  })
})

const data = computed(() => ({
  labels: props.chartData.labels,
  datasets: [
    {
      data: props.chartData.data,
      backgroundColor: props.chartData.colors,
      borderWidth: 0,
      hoverOffset: 4
    }
  ]
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '80%',
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#212B36',
      padding: 10,
      cornerRadius: 8,
      bodyFont: {
        family: "'Bai Jamjuree', sans-serif"
      },
      titleFont: {
        family: "'Bai Jamjuree', sans-serif"
      }
    }
  }
}
</script>

<template>
  <div class="h-full flex flex-col min-w-0">
    <h6 v-if="title" class="text-lg font-bold text-textPrimary mb-1">{{ title }}</h6>
    <p v-if="subtitle" class="text-sm text-textSecondary mb-6">{{ subtitle }}</p>

    <div class="flex-1 relative flex items-center justify-center min-h-[200px]">
      <Doughnut :data="data" :options="options" />
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-sm text-textSecondary font-semibold">Total</span>
        <span class="text-2xl font-bold text-textPrimary">{{ total }}</span>
      </div>
    </div>

    <div class="flex justify-center flex-wrap gap-4 mt-6">
      <div
        v-for="(label, index) in chartData.labels"
        :key="label"
        class="flex items-center text-xs font-semibold text-textPrimary"
      >
        <span
          class="w-3 h-3 rounded-full mr-2"
          :style="{ backgroundColor: chartData.colors[index] }"
        ></span>
        {{ label }}
      </div>
    </div>
  </div>
</template>
