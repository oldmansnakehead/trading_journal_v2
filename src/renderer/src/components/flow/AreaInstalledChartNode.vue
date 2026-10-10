<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import AreaInstalledChart from '../ui/AreaInstalledChart.vue'

defineProps<{ data?: any }>()
</script>
<template>
  <div class="min-w-[500px]">
    <Handle type="target" :position="Position.Top" class="!bg-gray-300" />
    <AreaInstalledChart v-bind="data" />
    <Handle type="source" :position="Position.Bottom" class="!bg-primary" />
  </div>
</template>
