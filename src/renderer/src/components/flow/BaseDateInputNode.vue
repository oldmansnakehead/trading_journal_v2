<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import BaseDateInput from '../ui/BaseDateInput.vue'
import { ref } from 'vue'

const props = defineProps<{
  data: {
    withTime?: boolean
    value?: string
  }
}>()

const dateValue = ref(props.data.value || '')
</script>

<template>
  <div class="bg-white rounded-xl shadow-card p-4 min-w-[250px] border border-gray-100">
    <Handle type="target" :position="Position.Top" class="!bg-gray-300" />
    
    <BaseDateInput 
      v-model="dateValue"
      :withTime="data.withTime"
    />

    <Handle type="source" :position="Position.Bottom" class="!bg-primary" />
  </div>
</template>
