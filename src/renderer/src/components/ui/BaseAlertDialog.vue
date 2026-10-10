<template>
  <Transition name="toast">
    <div
      v-if="isOpen"
      class="fixed top-6 right-6 z-[100] flex items-start bg-white rounded-xl shadow-lg border border-gray-100 p-4 max-w-sm w-full"
    >
      <!-- Icon -->
      <div 
        class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4"
        :class="iconClass"
      >
        <!-- Success -->
        <svg v-if="variant === 'success'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        
        <!-- Error -->
        <svg v-else-if="variant === 'error'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" x2="12" y1="8" y2="12"/>
          <line x1="12" x2="12.01" y1="16" y2="16"/>
        </svg>

        <!-- Info -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" x2="12" y1="16" y2="12"/>
          <line x1="12" x2="12.01" y1="8" y2="8"/>
        </svg>
      </div>

      <div class="flex-1 pt-1">
        <h3 class="text-base font-bold text-gray-900 mb-1">{{ title }}</h3>
        <p class="text-sm text-gray-500 whitespace-pre-wrap">{{ message }}</p>
      </div>

      <!-- Close Button (optional manual close) -->
      <button 
        @click="$emit('close')"
        class="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'info' // 'success' | 'error' | 'info'
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(['close'])

let timeoutId: number | null = null

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => {
      emit('close')
    }, props.duration)
  }
})

const iconClass = computed(() => {
  if (props.variant === 'success') return 'bg-green-100 text-green-600'
  if (props.variant === 'error') return 'bg-red-100 text-red-600'
  return 'bg-blue-100 text-blue-600'
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
