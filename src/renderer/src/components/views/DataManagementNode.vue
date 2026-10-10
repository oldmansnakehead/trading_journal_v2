<template>
  <div class="bg-white border-2 border-slate-500 rounded-lg p-3 shadow-md w-[280px]">
    <div class="font-bold text-sm mb-2 text-slate-700 flex items-center gap-2">
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
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" x2="12" y1="15" y2="3" />
      </svg>
      DataManagement View
    </div>
    <div class="text-xs text-gray-600 mb-2">
      UI for managing backups. Includes Export to .zip and Import from .zip actions.
    </div>
    <div class="flex flex-col gap-1 text-[10px] text-gray-500 bg-gray-50 p-2 rounded">
      <div>Props: None</div>
      <div>State: isExporting, isImporting</div>
      <div>API: window.api.backup</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Vue Flow Node for DataManagement view
</script>
