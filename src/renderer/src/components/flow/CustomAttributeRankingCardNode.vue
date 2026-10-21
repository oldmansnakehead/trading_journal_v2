<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import CustomAttributeRankingCard from '../ui/CustomAttributeRankingCard.vue'

defineProps<{
  data?: {
    trades?: any[]
    availableColumns?: any[]
    statMode?: 'normal' | 'be' | 'trail'
  }
}>()
</script>

<template>
  <div class="bg-white rounded-2xl shadow-card p-4 min-w-[700px] border border-gray-100">
    <Handle type="target" :position="Position.Top" class="!bg-gray-300" />

    <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
      <i class="ph-bold ph-trophy text-amber-500"></i>
      Custom Attribute Ranking Node
    </div>

    <CustomAttributeRankingCard
      :trades="data?.trades || []"
      :availableColumns="data?.availableColumns || []"
      :statMode="data?.statMode || 'normal'"
    />

    <Handle type="source" :position="Position.Bottom" class="!bg-primary" />
  </div>
</template>
