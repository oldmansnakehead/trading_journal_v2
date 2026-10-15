<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

defineProps<{
  id: string
  data: {
    title: string
    description?: string
    isMandatory?: boolean
    tag?: string
  }
  selected?: boolean
}>()
</script>

<template>
  <div
    class="min-w-[220px] max-w-[280px] bg-white rounded-xl border-2 shadow-sm transition-all duration-150 overflow-hidden"
    :class="[
      selected ? 'border-indigo-500 shadow-md ring-2 ring-indigo-200' : 'border-indigo-200 hover:border-indigo-300'
    ]"
  >
    <!-- Top target handle -->
    <Handle type="target" :position="Position.Top" class="!bg-indigo-500 !w-3 !h-3 !border-2 !border-white" />

    <!-- Node Header -->
    <div class="bg-indigo-50 px-3.5 py-2 border-b border-indigo-100 flex items-center justify-between">
      <div class="flex items-center gap-1.5 text-indigo-800 font-bold text-xs uppercase tracking-wider">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        <span>Condition & Rule</span>
      </div>
      <span
        v-if="data.isMandatory"
        class="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800"
      >
        Required
      </span>
      <span
        v-else-if="data.tag"
        class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700"
      >
        {{ data.tag }}
      </span>
    </div>

    <!-- Node Body -->
    <div class="p-3 bg-white">
      <div class="font-bold text-sm text-gray-900 leading-snug mb-1">
        {{ data.title || 'Rule Condition' }}
      </div>
      <div v-if="data.description" class="text-xs text-gray-500 line-clamp-3 leading-relaxed">
        {{ data.description }}
      </div>
    </div>

    <!-- Bottom source handle -->
    <Handle type="source" :position="Position.Bottom" class="!bg-indigo-500 !w-3 !h-3 !border-2 !border-white" />
  </div>
</template>
