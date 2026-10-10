<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    valueText?: string
    subValueText?: string
    percentage: number
    colorType?: 'primary' | 'info' | 'error' | 'success' | 'warning'
  }>(),
  {
    colorType: 'primary'
  }
)

const colorClass = computed(() => {
  switch (props.colorType) {
    case 'info':
      return 'bg-info'
    case 'error':
      return 'bg-error'
    case 'success':
      return 'bg-success'
    case 'warning':
      return 'bg-warning'
    default:
      return 'bg-primary'
  }
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm font-semibold text-textSecondary">{{ label }}</span>
      <div v-if="valueText || subValueText" class="text-sm font-bold text-textPrimary">
        {{ valueText }}
        <span v-if="subValueText" class="text-textSecondary font-medium ml-1">{{ subValueText }}</span>
      </div>
    </div>
    <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="colorClass"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>
  </div>
</template>
