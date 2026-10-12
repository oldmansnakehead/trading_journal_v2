<template>
  <div class="bg-white border-2 border-primary rounded-lg p-3 shadow-md w-[280px]">
    <div class="font-bold text-sm mb-2 text-primary flex items-center gap-2">
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
        <circle cx="12" cy="12" r="10" />
        <line x1="22" y1="12" x2="18" y2="12" />
        <line x1="6" y1="12" x2="2" y2="12" />
        <line x1="12" y1="6" x2="12" y2="2" />
        <line x1="12" y1="22" x2="12" y2="18" />
      </svg>
      EdgeAnalysisView View
    </div>
    <div class="text-xs text-gray-600 mb-2">
      Edge analysis view evaluating setup comparison, R-multiple distribution histogram, Day x Hour
      heatmap, and MAE / MFE excursion scatter analysis.
    </div>
    <div class="flex flex-col gap-1 text-[10px] text-gray-500 bg-gray-50 p-2 rounded">
      <div>Props: None</div>
      <div>State: Filters, Setup Comparison, R-Dist, Heatmap, MAE/MFE Scatter</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Vue Flow Node for EdgeAnalysisView view
</script>
