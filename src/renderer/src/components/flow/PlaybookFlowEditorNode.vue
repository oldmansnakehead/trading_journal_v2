<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import PlaybookFlowEditor from '../ui/PlaybookFlowEditor.vue'

const props = defineProps<{
  data?: {
    title?: string
    readOnly?: boolean
    initialFlowData?: any
  }
}>()
</script>

<template>
  <div class="bg-white rounded-2xl shadow-card p-4 min-w-[680px] max-w-[800px] border border-gray-100">
    <Handle type="target" :position="Position.Top" class="!bg-gray-300" />

    <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
        <path d="M7 7h10"/>
        <path d="M7 12h10"/>
        <path d="M7 17h10"/>
      </svg>
      Playbook Flow Editor Node
    </div>

    <div class="h-[380px] w-full overflow-hidden rounded-xl">
      <PlaybookFlowEditor
        :title="props.data?.title || 'Visual Playbook Node'"
        :read-only="props.data?.readOnly ?? true"
        :initial-flow-data="props.data?.initialFlowData"
      />
    </div>

    <Handle type="source" :position="Position.Bottom" class="!bg-blue-600" />
  </div>
</template>
