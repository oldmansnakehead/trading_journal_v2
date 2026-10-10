<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import BaseInput from '../ui/BaseInput.vue'
import { ref } from 'vue'

const props = defineProps<{
  data: {
    placeholder?: string
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
    value?: string | number
  }
}>()

const emit = defineEmits(['updateNodeInternals'])
const inputValue = ref(props.data.value || '')

// If we wanted to propagate value changes to the node's data in Vue Flow,
// we could do so via an event or store, but for display this is fine.
</script>

<template>
  <div class="bg-white rounded-xl shadow-card p-4 min-w-[250px] border border-gray-100">
    <Handle type="target" :position="Position.Top" class="!bg-gray-300" />

    <BaseInput
      v-model="inputValue"
      :placeholder="data.placeholder || 'Enter text...'"
      :type="data.type || 'text'"
    />

    <Handle type="source" :position="Position.Bottom" class="!bg-primary" />
  </div>
</template>
