<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import BaseSelect, { SelectOption } from '../ui/BaseSelect.vue'
import { ref } from 'vue'

const props = defineProps<{
  data?: {
    placeholder?: string
    value?: string | number
    options?: (SelectOption | string | number)[]
  }
}>()

const selectedValue = ref(props.data?.value || '')
const defaultOptions: SelectOption[] = [
  { label: 'SMC Classic', value: '1' },
  { label: 'ICT Judas Swing', value: '2' },
  { label: 'Break & Retest', value: '3' }
]
</script>

<template>
  <div class="bg-white rounded-xl shadow-card p-4 min-w-[250px] border border-gray-100">
    <Handle type="target" :position="Position.Top" class="!bg-gray-300" />

    <BaseSelect
      v-model="selectedValue"
      :options="props.data?.options || defaultOptions"
      :placeholder="props.data?.placeholder || 'Select setup...'"
    />

    <Handle type="source" :position="Position.Bottom" class="!bg-primary" />
  </div>
</template>
