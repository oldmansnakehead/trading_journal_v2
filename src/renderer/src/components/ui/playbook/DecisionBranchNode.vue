<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

defineProps<{
  id: string
  data: {
    title: string
    description?: string
    yesLabel?: string
    noLabel?: string
  }
  selected?: boolean
}>()
</script>

<template>
  <div
    class="min-w-[220px] max-w-[280px] bg-white rounded-xl border-2 shadow-sm transition-all duration-150 relative"
    :class="[
      selected ? 'border-amber-500 shadow-md ring-2 ring-amber-200' : 'border-amber-200 hover:border-amber-300'
    ]"
  >
    <!-- Top target handle -->
    <Handle type="target" :position="Position.Top" class="!bg-amber-500 !w-3 !h-3 !border-2 !border-white" />

    <!-- Node Header -->
    <div class="bg-amber-50 px-3.5 py-2 border-b border-amber-100 flex items-center justify-between rounded-t-[10px]">
      <div class="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase tracking-wider">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="18" r="3"/>
          <circle cx="6" cy="6" r="3"/>
          <circle cx="18" cy="6" r="3"/>
          <path d="M18 9v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"/>
          <path d="M12 12v3"/>
        </svg>
        <span>Decision Gate</span>
      </div>
    </div>

    <!-- Node Body -->
    <div class="p-3 bg-white">
      <div class="font-bold text-sm text-gray-900 leading-snug mb-1">
        {{ data.title || 'Check Decision' }}
      </div>
      <div v-if="data.description" class="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-3">
        {{ data.description }}
      </div>

      <!-- Yes / No branch handles with labels -->
      <div class="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] font-bold text-gray-400">
        <div class="flex items-center gap-1 text-red-600">
          <span>{{ data.noLabel || 'No / Skip' }}</span>
        </div>
        <div class="flex items-center gap-1 text-emerald-600">
          <span>{{ data.yesLabel || 'Yes / Proceed' }}</span>
        </div>
      </div>
    </div>

    <!-- Output Handles: Left = No, Right = Yes -->
    <Handle
      id="no"
      type="source"
      :position="Position.Left"
      class="!bg-red-500 !w-3 !h-3 !border-2 !border-white"
    />
    <Handle
      id="yes"
      type="source"
      :position="Position.Right"
      class="!bg-emerald-500 !w-3 !h-3 !border-2 !border-white"
    />
    <!-- Fallback bottom handle -->
    <Handle
      id="default"
      type="source"
      :position="Position.Bottom"
      class="!bg-amber-500 !w-3 !h-3 !border-2 !border-white"
    />
  </div>
</template>
