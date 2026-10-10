<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import SalesOverviewCard from '../ui/SalesOverviewCard.vue'

defineProps<{ data?: any }>()
</script>

<template>
  <div class="min-w-[320px]">
    <Handle type="target" :position="Position.Top" class="!bg-gray-300" />
    <SalesOverviewCard v-bind="data" />
    <Handle type="source" :position="Position.Bottom" class="!bg-primary" />
  </div>
</template>
