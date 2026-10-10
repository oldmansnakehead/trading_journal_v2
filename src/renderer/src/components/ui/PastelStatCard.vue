<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: string | number
  trend?: number
  icon: string
  color?: 'success' | 'info' | 'warning' | 'error' | 'primary'
}

const props = withDefaults(defineProps<Props>(), {
  trend: 0,
  color: 'success'
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

const styles = computed(() => {
  const map: Record<string, { bg: string; iconBg: string; iconText: string; text: string }> = {
    success: {
      bg: 'bg-[#e4f8ed]',
      iconBg: 'bg-[#bce6cb]',
      iconText: 'text-[#0e7c3a]',
      text: 'text-[#004B50]'
    },
    info: {
      bg: 'bg-[#e0edff]',
      iconBg: 'bg-[#cce0ff]',
      iconText: 'text-blue-600',
      text: 'text-[#002D62]'
    },
    warning: {
      bg: 'bg-[#fdf3da]',
      iconBg: 'bg-[#fce5a8]',
      iconText: 'text-[#b27700]',
      text: 'text-[#7a4100]'
    },
    error: {
      bg: 'bg-[#fce8e8]',
      iconBg: 'bg-[#fad1d1]',
      iconText: 'text-red-500',
      text: 'text-[#7a0916]'
    },
    primary: {
      bg: 'bg-primary/10',
      iconBg: 'bg-primary/20',
      iconText: 'text-primary',
      text: 'text-textPrimary'
    }
  }
  return map[props.color] || map.success
})
</script>

<template>
  <div class="rounded-2xl p-6 shadow-sm" :class="styles.bg">
    <div class="flex justify-between items-start mb-4">
      <div
        class="w-10 h-10 rounded-full flex items-center justify-center text-xl"
        :class="[styles.iconBg, styles.iconText]"
      >
        <i class="ph-fill" :class="icon"></i>
      </div>
      <div class="flex items-center text-sm font-bold" :class="styles.iconText">
        <i class="ph mr-1" :class="trendIcon"></i> {{ trendFormatted }}
      </div>
    </div>
    <h3 class="text-3xl font-bold mb-1" :class="styles.text">{{ value }}</h3>
    <h6 class="text-sm font-semibold text-textSecondary">{{ title }}</h6>
  </div>
</template>
