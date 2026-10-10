<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import StatCard from '../ui/StatCard.vue'

defineProps<{
  data?: any
}>()
</script>

<template>
  <div class="min-w-[320px]">
    <Handle type="target" :position="Position.Top" class="!bg-gray-300" />

    <StatCard
      :title="data?.title || 'Total active users'"
      :value="data?.value || '18,765'"
      :trend="data?.trend ?? 2.6"
      :trendLabel="data?.trendLabel || 'last 7 days'"
      :chartColor="data?.chartColor || 'success'"
      :chartData="data?.chartData"
    />

    <Handle type="source" :position="Position.Bottom" class="!bg-primary" />
  </div>
</template>
