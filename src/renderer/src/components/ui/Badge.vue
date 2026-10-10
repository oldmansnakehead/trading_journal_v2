<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type?: 'success' | 'error' | 'warning' | 'info' | 'primary'
}>()

const typeClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-success/20 text-success-dark'
    case 'error':
      return 'bg-error/20 text-error-dark'
    case 'warning':
      return 'bg-warning/20 text-warning-dark'
    case 'info':
      return 'bg-info/20 text-info-dark'
    case 'primary':
      return 'bg-primary/20 text-primary-dark'
    default:
      return 'bg-gray-200 text-gray-700'
  }
})
</script>

<template>
  <span
    class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold"
    :class="typeClasses"
  >
    <slot></slot>
  </span>
</template>
