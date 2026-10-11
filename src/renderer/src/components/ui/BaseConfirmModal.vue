<template>
  <Transition name="modal-fade">
    <div
      v-if="isOpen"
      @click.self="$emit('cancel')"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
    >
      <div
        class="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col transform transition-all border border-gray-100"
      >
        <div class="p-6">
          <div class="flex items-center gap-4 mb-4">
            <div
              class="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center shadow-sm"
              :class="iconBgClass"
            >
              <!-- Danger (Trash) -->
              <svg
                v-if="variant === 'danger'"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" x2="10" y1="11" y2="17" />
                <line x1="14" x2="14" y1="11" y2="17" />
              </svg>

              <!-- Warning (Triangle Alert) -->
              <svg
                v-else-if="variant === 'warning'"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
                />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>

              <!-- Success (Checkmark) -->
              <svg
                v-else-if="variant === 'success'"
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>

              <!-- Info (Info Circle) -->
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 leading-snug">{{ title }}</h3>
          </div>
          <p class="text-sm text-gray-500 whitespace-pre-line leading-relaxed">{{ message }}</p>
        </div>

        <div class="p-4 border-t border-gray-100 bg-gray-50/70 flex justify-end gap-3">
          <BaseButton v-if="showCancel" variant="outline" @click="$emit('cancel')">
            {{ cancelText }}
          </BaseButton>
          <button
            @click="$emit('confirm')"
            class="px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
            :class="confirmBtnClass"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from './BaseButton.vue'

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
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  variant: {
    type: String,
    default: 'danger' // 'danger' | 'warning' | 'info' | 'success'
  }
})

defineEmits(['confirm', 'cancel'])

const iconBgClass = computed(() => {
  if (props.variant === 'danger') return 'bg-red-100 text-red-600'
  if (props.variant === 'warning') return 'bg-orange-100 text-orange-600'
  if (props.variant === 'success') return 'bg-emerald-100 text-emerald-600'
  return 'bg-blue-100 text-blue-600'
})

const confirmBtnClass = computed(() => {
  if (props.variant === 'danger') return 'bg-red-600 hover:bg-red-700 text-white'
  if (props.variant === 'warning') return 'bg-orange-600 hover:bg-orange-700 text-white'
  if (props.variant === 'success') return 'bg-emerald-600 hover:bg-emerald-700 text-white'
  return 'bg-blue-600 hover:bg-blue-700 text-white'
})
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.2s ease-out;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
