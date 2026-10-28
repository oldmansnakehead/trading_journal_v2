<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Chart 1: Outcome Distribution per Zone -->
    <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col justify-between">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h4 class="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <i class="ph ph-chart-bar text-primary text-base"></i>
            สัดส่วนผลลัพธ์แยกตามโซน (Wins / Losses / Missed)
          </h4>
          <p class="text-xs text-gray-400 mt-0.5">จำนวนครั้งที่ ชนะ, แพ้, เท่าทุน และ ตกรถ ในแต่ละโซน</p>
        </div>
      </div>

      <div v-if="metrics.length === 0" class="h-64 flex items-center justify-center text-gray-400 text-xs">
        ไม่มีข้อมูลกราฟ
      </div>
      <div v-else class="h-64 w-full">
        <Bar :data="distributionChartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Chart 2: Expected Value (EV) vs Max RR -->
    <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col justify-between">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h4 class="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <i class="ph ph-chart-line-up text-primary text-base"></i>
            ความคุ้มค่า (Expected Value) vs Peak Max RR
          </h4>
          <p class="text-xs text-gray-400 mt-0.5">เปรียบเทียบกำไรคาดหวังต่อไม้และศักยภาพ RR สูงสุด</p>
        </div>
      </div>

      <div v-if="metrics.length === 0" class="h-64 flex items-center justify-center text-gray-400 text-xs">
        ไม่มีข้อมูลกราฟ
      </div>
      <div v-else class="h-64 w-full">
        <Bar :data="evChartData" :options="evChartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
import type { ZoneComparisonMetric } from '../../../../../shared/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  metrics: ZoneComparisonMetric[]
}>()

const labels = computed(() => props.metrics.map((m) => m.columnName))

// Chart 1: Outcome Distribution
const distributionChartData = computed(() => {
  return {
    labels: labels.value,
    datasets: [
      {
        label: 'ชนะ (Wins)',
        backgroundColor: '#10b981', // emerald-500
        data: props.metrics.map((m) => m.winCount),
        stack: 'outcomes'
      },
      {
        label: 'แพ้ (Losses)',
        backgroundColor: '#ef4444', // red-500
        data: props.metrics.map((m) => m.lossCount),
        stack: 'outcomes'
      },
      {
        label: 'เสมอ (BE)',
        backgroundColor: '#9ca3af', // gray-400
        data: props.metrics.map((m) => m.beCount),
        stack: 'outcomes'
      },
      {
        label: 'ตกรถ (Missed)',
        backgroundColor: '#f59e0b', // amber-500
        data: props.metrics.map((m) => m.missedCount),
        stack: 'outcomes'
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: true,
      grid: { display: false }
    },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: { precision: 0 }
    }
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: { boxWidth: 12, font: { size: 11, weight: 'bold' as const } }
    }
  }
}

// Chart 2: EV vs Max RR
const evChartData = computed(() => {
  return {
    labels: labels.value,
    datasets: [
      {
        label: 'Expected Value (EV)',
        backgroundColor: '#3b82f6', // blue-500
        data: props.metrics.map((m) => m.expectedValue)
      },
      {
        label: 'Avg Max RR',
        backgroundColor: '#a855f7', // purple-500
        data: props.metrics.map((m) => m.avgMaxRr)
      }
    ]
  }
})

const evChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { display: false }
    },
    y: {
      beginAtZero: true
    }
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: { boxWidth: 12, font: { size: 11, weight: 'bold' as const } }
    }
  }
}
</script>
