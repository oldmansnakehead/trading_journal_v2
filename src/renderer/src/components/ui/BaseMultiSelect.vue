<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface SelectOption {
  label: string
  value: string | number
}

const props = defineProps<{
  modelValue: (string | number)[]
  options: (SelectOption | string | number)[]
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: (string | number)[]): void
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Normalize options to always be objects
const normalizedOptions = computed<SelectOption[]>(() => {
  return props.options.map((opt) => {
    if (typeof opt === 'object' && opt !== null && 'label' in opt && 'value' in opt) {
      return opt as SelectOption
    }
    return { label: String(opt), value: opt }
  })
})

const toggleDropdown = (): void => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const toggleOption = (option: SelectOption): void => {
  const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const index = currentValues.indexOf(option.value)
  
  if (index === -1) {
    currentValues.push(option.value)
  } else {
    currentValues.splice(index, 1)
  }
  
  emit('update:modelValue', currentValues)
}

// Click outside to close
const handleClickOutside = (event: MouseEvent): void => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const displayLabel = computed(() => {
  if (!Array.isArray(props.modelValue) || props.modelValue.length === 0) {
    return props.placeholder || 'Select...'
  }
  
  const selectedLabels = props.modelValue
    .map(val => normalizedOptions.value.find(opt => opt.value === val)?.label)
    .filter(Boolean)
    
  if (selectedLabels.length <= 2) {
    return selectedLabels.join(', ')
  }
  return `${selectedLabels.length} selected`
})
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <div
      class="flex items-center justify-between bg-gray-50 border text-sm rounded-lg px-3 py-2 cursor-pointer select-none transition-all duration-200 min-w-[120px]"
      :class="[
        isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300',
        disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white'
      ]"
      @click="toggleDropdown"
    >
      <span class="text-gray-700 font-medium truncate mr-2">
        {{ displayLabel }}
      </span>
      <i
        class="ph ph-caret-down text-gray-400 transition-transform duration-200"
        :class="{ 'transform rotate-180 text-primary': isOpen }"
      ></i>
    </div>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 max-h-60 overflow-y-auto outline-none"
      >
        <div
          v-for="option in normalizedOptions"
          :key="option.value"
          class="px-3 py-2 text-sm cursor-pointer transition-colors duration-150 flex items-center justify-between"
          :class="[
            (modelValue || []).includes(option.value)
              ? 'bg-primary/10 text-primary font-bold'
              : 'text-gray-700 hover:bg-gray-50 font-medium'
          ]"
          @click.stop="toggleOption(option)"
        >
          <span class="truncate">{{ option.label }}</span>
          <div class="w-4 h-4 rounded border flex items-center justify-center transition-colors"
               :class="(modelValue || []).includes(option.value) ? 'bg-primary border-primary text-white' : 'border-gray-300'">
            <svg v-if="(modelValue || []).includes(option.value)" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>

        <div
          v-if="normalizedOptions.length === 0"
          class="px-3 py-4 text-center text-sm text-gray-500"
        >
          No options available
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Custom scrollbar for dropdown */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 10px;
}
</style>
