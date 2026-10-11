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
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <circle cx="15.5" cy="8.5" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="8.5" cy="15.5" r="1.5" />
        <circle cx="15.5" cy="15.5" r="1.5" />
      </svg>
      MonteCarloView View
    </div>
    <div class="text-xs text-gray-600 mb-2">
      Monte Carlo simulation view implementing Van Tharp R-multiple bootstrap and Kevin Davey risk analysis with Web Worker execution.
    </div>
    <div class="flex flex-col gap-1 text-[10px] text-gray-500 bg-gray-50 p-2 rounded">
      <div>Props: None</div>
      <div>State: Filters, Simulation Parameters, Equity Cone, Histograms</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Vue Flow Node for MonteCarloView view
</script>
