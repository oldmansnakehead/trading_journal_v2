<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import YearlySalesChart from '../ui/YearlySalesChart.vue'

defineProps<{ data?: any }>()
</script>
<template>
  <div class="min-w-[600px]">
    <Handle type="target" :position="Position.Top" class="!bg-gray-300" />
    <YearlySalesChart v-bind="data" />
    <Handle type="source" :position="Position.Bottom" class="!bg-primary" />
  </div>
</template>
