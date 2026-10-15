<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface SelectOption {
  label: string
  value: string | number
}

const props = defineProps<{
  modelValue: string | number
  options: (SelectOption | string | number)[]
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
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

const isOptionSelected = (option: SelectOption): boolean => {
  return (
    option.value === props.modelValue ||
    (props.modelValue !== '' &&
      props.modelValue !== null &&
      props.modelValue !== undefined &&
      String(option.value) === String(props.modelValue))
  )
}

const selectedOption = computed(() => {
  return normalizedOptions.value.find((opt) => isOptionSelected(opt))
})

const toggleDropdown = (): void => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const selectOption = (option: SelectOption): void => {
  isOpen.value = false
  emit('update:modelValue', option.value)
}

// Click outside to close
const handleClickOutside = (event: MouseEvent): void => {
  if (isOpen.value && dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
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
      @mousedown.stop
      @click.stop="toggleDropdown"
    >
      <span class="text-gray-700 font-medium truncate mr-2">
        {{ selectedOption ? selectedOption.label : placeholder || 'Select...' }}
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
        @mousedown.stop
        @click.stop
      >
        <div
          v-for="option in normalizedOptions"
          :key="option.value"
          class="px-3 py-2 text-sm cursor-pointer transition-colors duration-150 flex items-center justify-between"
          :class="[
            isOptionSelected(option)
              ? 'bg-primary/10 text-primary font-bold'
              : 'text-gray-700 hover:bg-gray-50 font-medium'
          ]"
          @mousedown.stop
          @click.stop="selectOption(option)"
        >
          <span class="truncate">{{ option.label }}</span>
          <i v-if="isOptionSelected(option)" class="ph-bold ph-check text-primary"></i>
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
