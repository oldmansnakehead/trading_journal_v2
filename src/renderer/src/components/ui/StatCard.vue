<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  value: string | number
  trendValue?: string
  trendLabel?: string
  trendType?: 'up' | 'down' | 'neutral'
  colorType?: 'primary' | 'info' | 'error' | 'success' | 'warning'
}>()

const trendClasses = computed(() => {
  switch (props.trendType) {
    case 'up':
      return 'text-success bg-success/10'
    case 'down':
      return 'text-error bg-error/10'
    default:
      return 'text-primary bg-primary/10' // default or neutral
  }
})

const trendIcon = computed(() => {
  if (props.trendType === 'up') return 'ph-trend-up'
  if (props.trendType === 'down') return 'ph-trend-down'
  return 'ph-minus'
})

// We use hardcoded classes for the decorative bars on the right because Tailwind needs to statically analyze them.
const colorClasses = computed(() => {
  switch (props.colorType) {
    case 'info':
      return 'text-info'
    case 'error':
      return 'text-error'
    case 'success':
      return 'text-success'
    case 'warning':
      return 'text-warning'
    default:
      return 'text-primary'
  }
})

const barClasses = computed(() => {
  switch (props.colorType) {
    case 'info': return 'bg-info'
    case 'error': return 'bg-error'
    case 'success': return 'bg-success'
    case 'warning': return 'bg-warning'
    default: return 'bg-primary'
  }
})
</script>

<template>
  <div class="bg-white rounded-2xl p-6 shadow-card flex items-center justify-between">
    <div>
      <h6 class="text-sm font-semibold text-textSecondary mb-2">{{ title }}</h6>
      <h3 class="text-3xl font-bold mb-2 text-textPrimary">{{ value }}</h3>
      <div v-if="trendValue" class="flex items-center text-sm font-medium gap-1">
        <div class="flex items-center px-1.5 py-0.5 rounded" :class="trendClasses">
          <i class="ph mr-1" :class="trendIcon"></i> {{ trendValue }}
        </div>
        <span class="text-textSecondary">{{ trendLabel }}</span>
      </div>
    </div>
    
    <div class="w-16 h-16 opacity-30" :class="colorClasses">
      <!-- Decorative miniature chart (we can make this randomly generated or static) -->
      <div class="flex items-end h-full gap-1">
        <div class="w-2 h-1/3 rounded-t" :class="barClasses"></div>
        <div class="w-2 h-2/3 rounded-t" :class="barClasses"></div>
        <div class="w-2 h-1/2 rounded-t" :class="barClasses"></div>
        <div class="w-2 h-full rounded-t" :class="barClasses"></div>
        <div class="w-2 h-3/4 rounded-t" :class="barClasses"></div>
      </div>
    </div>
  </div>
</template>
