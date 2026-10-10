<script setup lang="ts">
import { computed, useSlots } from 'vue'

interface Props {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  disabled?: boolean
  error?: string
  inputClass?: string
  wrapperClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  error: '',
  inputClass: '',
  wrapperClass: ''
})

const model = defineModel<string | number>()
const slots = useSlots()

const containerClass = computed(() => {
  return [
    'flex relative items-center w-full bg-white border rounded-xl transition-colors focus-within:ring-1 focus-within:border-textPrimary focus-within:ring-textPrimary',
    props.error
      ? 'border-error focus-within:border-error focus-within:ring-error'
      : 'border-gray-200',
    props.disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : '',
    props.wrapperClass
  ]
})

const defaultInputClass = computed(() => {
  return [
    'flex-1 bg-transparent text-sm font-medium py-3 focus:outline-none w-full min-w-0',
    props.error
      ? 'text-error placeholder:text-error/60'
      : 'text-textPrimary placeholder:text-textSecondary/60',
    props.disabled ? 'cursor-not-allowed' : '',
    // Adjust padding if slots are present, otherwise default to px-4
    !slots.prefix ? 'pl-4' : 'pl-2',
    !slots.suffix ? 'pr-4' : 'pr-2',
    props.inputClass
  ]
})
</script>

<template>
  <div class="w-full">
    <div :class="containerClass">
      <div v-if="slots.prefix" class="flex-shrink-0 flex items-center pl-4 py-3">
        <slot name="prefix"></slot>
      </div>

      <input
        v-model="model"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="defaultInputClass"
      />

      <div v-if="slots.suffix" class="flex-shrink-0 flex items-center pr-4 py-3">
        <slot name="suffix"></slot>
      </div>
    </div>
    <p v-if="error" class="text-error text-xs mt-1.5 font-medium ml-1">
      {{ error }}
    </p>
  </div>
</template>
