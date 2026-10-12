<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import AppSidebar from '../ui/AppSidebar.vue'

defineProps<{
  data?: any
}>()
</script>

<template>
  <div class="bg-white rounded-2xl shadow-xl min-w-[280px] h-[650px] border border-gray-100 overflow-hidden relative">
    <Handle type="target" :position="Position.Top" class="!bg-gray-300" />

    <div class="h-full">
      <AppSidebar />
    </div>

    <Handle type="source" :position="Position.Bottom" class="!bg-primary" />
  </div>
</template>
