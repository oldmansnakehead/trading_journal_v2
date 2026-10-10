<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import CalendarView from '../ui/CalendarView.vue'

defineProps<{
  data?: any
}>()
</script>

<template>
  <div class="bg-white rounded-2xl shadow-xl min-w-[800px] border border-gray-100 p-2">
    <Handle type="target" :position="Position.Top" class="!bg-gray-300" />
    
    <div class="h-[600px]">
      <CalendarView />
    </div>

    <Handle type="source" :position="Position.Bottom" class="!bg-primary" />
  </div>
</template>
