<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import AppUpdateCard from '../ui/AppUpdateCard.vue'

defineProps<{
  data?: Record<string, any>
}>()
</script>

<template>
  <div class="bg-white rounded-2xl shadow-card p-4 min-w-[650px] border border-gray-100">
    <Handle type="target" :position="Position.Top" class="!bg-gray-300" />

    <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
      <i class="ph-bold ph-arrow-circle-up text-primary"></i>
      Application Auto-Updater Node
    </div>

    <AppUpdateCard />

    <Handle type="source" :position="Position.Bottom" class="!bg-primary" />
  </div>
</template>
