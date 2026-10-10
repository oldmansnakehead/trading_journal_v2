<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
  >
    <div class="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden flex flex-col transform transition-all">
      <div class="p-6">
        <div class="flex items-center gap-4 mb-4">
          <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
               :class="variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'">
            <svg v-if="variant === 'danger'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              <line x1="10" x2="10" y1="11" y2="17"/>
              <line x1="14" x2="14" y1="11" y2="17"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" x2="12" y1="8" y2="12"/>
              <line x1="12" x2="12.01" y1="16" y2="16"/>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900">{{ title }}</h3>
        </div>
        <p class="text-sm text-gray-500 whitespace-pre-wrap">{{ message }}</p>
      </div>
      
      <div class="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
        <BaseButton variant="outline" @click="$emit('cancel')">
          {{ cancelText }}
        </BaseButton>
        <button
          @click="$emit('confirm')"
          class="px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
          :class="variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from './BaseButton.vue'

defineProps({
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
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  variant: {
    type: String,
    default: 'danger' // 'danger' | 'info'
  }
})

defineEmits(['confirm', 'cancel'])
</script>
