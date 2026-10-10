<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <div class="bg-white rounded-2xl p-6 shadow-card h-full flex flex-col">
    <div v-if="title || $slots.header" class="mb-6">
      <slot name="header">
        <h6 v-if="title" class="text-lg font-bold text-textPrimary">{{ title }}</h6>
        <p v-if="subtitle" class="text-sm text-textSecondary">{{ subtitle }}</p>
      </slot>
    </div>
    
    <div class="flex-1 w-full flex flex-col relative">
      <slot></slot>
    </div>
  </div>
</template>
