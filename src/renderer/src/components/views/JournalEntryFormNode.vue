<template>
  <div class="bg-white border-2 border-indigo-500 rounded-lg p-3 shadow-md w-[280px]">
    <div class="font-bold text-sm mb-2 text-indigo-700 flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" x2="12" y1="3" y2="15" />
      </svg>
      JournalEntryForm View
    </div>
    <div class="text-xs text-gray-600 mb-2">
      Form for logging trading entries with multi-tab support for logging multiple setups simultaneously, batch save, duplicate tab, and draft management.
    </div>
    <div class="flex flex-col gap-1 text-[10px] text-gray-500 bg-gray-50 p-2 rounded">
      <div>Props: None</div>
      <div>State: Multi-Tab Trade Store (Pinia)</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Vue Flow Node for JournalEntryForm view
</script>
