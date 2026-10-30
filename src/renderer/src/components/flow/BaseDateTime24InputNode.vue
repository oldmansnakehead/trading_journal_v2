<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import BaseDateTime24Input from '../ui/BaseDateTime24Input.vue'
import { ref } from 'vue'

const props = defineProps<{
  data: {
    value?: string
    compact?: boolean
  }
}>()

const datetimeValue = ref(props.data?.value || '')
</script>

<template>
  <div class="bg-white rounded-xl shadow-card p-4 min-w-[260px] border border-gray-100">
    <Handle type="target" :position="Position.Top" class="!bg-gray-300" />

    <BaseDateTime24Input v-model="datetimeValue" :compact="data?.compact" />

    <Handle type="source" :position="Position.Bottom" class="!bg-primary" />
  </div>
</template>
