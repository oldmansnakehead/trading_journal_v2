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
  accentColor: '#0284c7'
})

function hexToRgba(hex: string, alpha = 0.15): string {
  let c = hex.replace('#', '')
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('')
  }
  const num = parseInt(c, 16)
  if (isNaN(num)) return `rgba(2, 132, 199, ${alpha})`
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.title,
      // For radar geometry scaling, ensure values plotted on axes are >= 0
      data: props.data.map((v) => Math.max(0, v)),
      backgroundColor: hexToRgba(props.accentColor, 0.16),
      borderColor: props.accentColor,
      borderWidth: 2,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: props.accentColor,
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6.5
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
        backgroundColor: '#0f172a',
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
          color: 'rgba(203, 213, 225, 0.7)', // slate-300
          lineWidth: 1
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.9)', // slate-200
          circular: false
        },
        pointLabels: {
          color: '#334155', // slate-700
          font: {
            family: "'Bai Jamjuree', sans-serif",
            size: 11,
            weight: 700
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
    class="bg-gray-50/70 hover:bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/70 hover:border-blue-200 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <span
          class="w-2.5 h-2.5 rounded-full"
          :style="{ backgroundColor: accentColor }"
        ></span>
        <h4 class="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
          {{ title }}
        </h4>
      </div>
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
    <div class="grid grid-cols-3 gap-1.5 pt-3 border-t border-gray-200/60 text-center">
      <div
        v-for="(label, idx) in labels"
        :key="label"
        class="bg-white rounded-xl py-2 px-1 border border-gray-200/70 shadow-2xs"
      >
        <p class="text-[10px] font-bold text-gray-400 truncate uppercase">{{ label }}</p>
        <p
          class="text-xs font-bold mt-0.5 truncate"
          :class="{
            'text-emerald-600': unit === '$' && data[idx] > 0,
            'text-rose-600': unit === '$' && data[idx] < 0,
            'text-gray-900': unit === '$' && data[idx] === 0,
            'text-sky-600': unit === '%',
            'text-indigo-600': unit === 'trades',
            'text-teal-600': unit === 'R'
          }"
        >
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
