<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  variant?: 'primary' | 'soft' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
}>()

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-primary hover:bg-primary-dark text-white'
    case 'soft':
      return 'bg-primary-light/20 hover:bg-primary-light/30 text-primary-dark'
    case 'outline':
      return 'border border-border text-textPrimary hover:bg-gray-50'
    case 'ghost':
      return 'text-textPrimary hover:bg-gray-100'
    default:
      return 'bg-primary hover:opacity-90 text-white'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'px-3 py-1.5 text-xs'
    case 'lg': return 'px-6 py-3 text-base'
    default: return 'px-5 py-2 text-sm'
  }
})
</script>

<template>
  <button 
    class="inline-flex items-center justify-center font-bold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
    :class="[variantClasses, sizeClasses]"
  >
    <i v-if="icon" class="ph mr-1.5" :class="icon"></i>
    <slot></slot>
  </button>
</template>
