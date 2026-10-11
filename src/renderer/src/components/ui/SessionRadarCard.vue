<script setup lang="ts">
import { computed } from 'vue'
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
import InfoTooltip from './InfoTooltip.vue'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface Props {
  title: string
  labels: string[]
  data: number[]
  unit?: string
  infoTitle?: string
  infoDescription?: string
  infoFormula?: string
  accentColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  accentColor: '#00b8d9'
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.title,
      // For radar geometry scaling, ensure values plotted on axes are >= 0
      data: props.data.map((v) => Math.max(0, v)),
      backgroundColor: 'rgba(0, 184, 217, 0.22)',
      borderColor: props.accentColor,
      borderWidth: 2,
      pointBackgroundColor: props.accentColor,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 1.5,
      pointRadius: 4.5,
      pointHoverRadius: 7
    }
  ]
}))

const chartOptions = computed(() => {
  const maxVal = Math.max(...props.data, 1)
  const isPercentage = props.unit === '%'

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#ffffff',
        bodyColor: '#38bdf8',
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        bodyFont: { family: "'Bai Jamjuree', sans-serif", weight: 'bold' as const },
        titleFont: { family: "'Bai Jamjuree', sans-serif" },
        callbacks: {
          label: (context: any) => {
            const raw = props.data[context.dataIndex]
            if (props.unit === '$') {
              return ` ${props.title}: ${raw >= 0 ? '+$' : '-$'}${Math.abs(raw).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }
            if (props.unit === '%') {
              return ` ${props.title}: ${raw}%`
            }
            if (props.unit === 'R') {
              return ` ${props.title}: ${raw}R`
            }
            return ` ${props.title}: ${raw} ${props.unit}`
          }
        }
      }
    },
    scales: {
      r: {
        min: 0,
        max: isPercentage ? 100 : undefined,
        suggestedMax: isPercentage ? 100 : Math.ceil(maxVal * 1.15),
        angleLines: {
          color: 'rgba(255, 255, 255, 0.15)',
          lineWidth: 1
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.15)',
          circular: false
        },
        pointLabels: {
          color: '#cbd5e1',
          font: {
            family: "'Bai Jamjuree', sans-serif",
            size: 11,
            weight: 600
          }
        },
        ticks: {
          display: false
        }
      }
    }
  }
})
</script>

<template>
  <div
    class="bg-gray-900/90 rounded-2xl p-4 sm:p-5 border border-gray-800 shadow-md flex flex-col justify-between hover:border-gray-700 transition-colors"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-2">
      <h4 class="text-sm sm:text-base font-bold text-white tracking-wide">
        {{ title }}
      </h4>
      <InfoTooltip
        v-if="infoTitle || infoDescription"
        :title="infoTitle"
        :description="infoDescription"
        :formula="infoFormula"
        align="right"
      />
    </div>

    <!-- Radar Chart Area -->
    <div class="w-full h-48 sm:h-52 relative flex items-center justify-center my-2">
      <Radar :data="chartData" :options="chartOptions" />
    </div>

    <!-- Values Pill Breakdown -->
    <div class="grid grid-cols-3 gap-1.5 pt-3 border-t border-gray-800/80 text-center">
      <div
        v-for="(label, idx) in labels"
        :key="label"
        class="bg-gray-800/60 rounded-lg py-1.5 px-1 border border-gray-700/50"
      >
        <p class="text-[10px] font-semibold text-gray-400 truncate uppercase">{{ label }}</p>
        <p class="text-xs font-bold text-sky-400 mt-0.5 truncate">
          <template v-if="unit === '$'">
            {{ data[idx] >= 0 ? '+$' : '-$' }}{{ Math.abs(data[idx]).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }}
          </template>
          <template v-else-if="unit === '%'">
            {{ data[idx] }}%
          </template>
          <template v-else-if="unit === 'R'">
            {{ data[idx] }}R
          </template>
          <template v-else>
            {{ data[idx] }}
          </template>
        </p>
      </div>
    </div>
  </div>
</template>
