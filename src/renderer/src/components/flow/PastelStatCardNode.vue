<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import PastelStatCard from '../ui/PastelStatCard.vue'

defineProps<{
  data?: any
}>()
</script>

<template>
  <div class="min-w-[280px]">
    <Handle type="target" :position="Position.Top" class="!bg-gray-300" />
    
    <PastelStatCard 
      :title="data?.title || 'Weekly sales'" 
      :value="data?.value || '714k'"
      :trend="data?.trend ?? 2.6"
      :icon="data?.icon || 'ph-bag'"
      :color="data?.color || 'success'"
    />

    <Handle type="source" :position="Position.Bottom" class="!bg-primary" />
  </div>
</template>
