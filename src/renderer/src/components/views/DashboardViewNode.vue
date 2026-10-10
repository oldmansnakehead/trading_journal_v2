<template>
  <div class="bg-white border-2 border-emerald-500 rounded-lg p-3 shadow-md w-[280px]">
    <div class="font-bold text-sm mb-2 text-emerald-700 flex items-center gap-2">
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
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
      DashboardView
    </div>
    <div class="text-xs text-gray-600 mb-2">
      Main analytics dashboard. Combines filters, stat mode switcher, KPI cards, and all charts.
    </div>
    <div class="flex flex-col gap-1 text-[10px] text-gray-500 bg-gray-50 p-2 rounded">
      <div>Props: None</div>
      <div>State: statMode, filters, kpis</div>
      <div>Deps: PastelStatCard, Charts</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Vue Flow Node for DashboardView
</script>
