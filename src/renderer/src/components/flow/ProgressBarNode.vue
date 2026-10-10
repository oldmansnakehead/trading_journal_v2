<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import ProgressBar from '../ui/ProgressBar.vue'

// Custom nodes in Vue Flow receive 'data' prop containing whatever was passed to the node definition
defineProps<{
  data: {
    label: string
    valueText?: string
    subValueText?: string
    percentage: number
    colorType?: 'primary' | 'info' | 'error' | 'success' | 'warning'
  }
}>()
</script>

<template>
  <div class="bg-white rounded-xl shadow-card p-4 min-w-[250px] border border-gray-100">
    <Handle type="target" :position="Position.Top" class="!bg-gray-300" />

    <ProgressBar
      :label="data.label"
      :valueText="data.valueText"
      :subValueText="data.subValueText"
      :percentage="data.percentage"
      :colorType="data.colorType"
    />

    <Handle type="source" :position="Position.Bottom" class="!bg-primary" />
  </div>
</template>
