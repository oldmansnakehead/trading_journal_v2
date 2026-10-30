<template>
  <div class="bg-white border-2 border-primary rounded-xl p-3 shadow-card w-[280px] font-sans">
    <div class="font-bold text-sm mb-2 text-primary flex items-center gap-2">
      <i class="ph ph-calculator text-base"></i>
      LotCalculatorView
    </div>
    <div class="text-xs text-textSecondary mb-2 leading-relaxed">
      Pre-trade position sizing calculator. Computes exact lot size based on account balance, risk %, and stop loss distance with conservative floor rounding.
    </div>
    <div class="flex flex-col gap-1 text-[10px] text-gray-500 bg-gray-50/70 p-2 rounded-lg border border-gray-100">
      <div>Mode: BUY (Emerald) / SELL (Rose)</div>
      <div>Inputs: Balance, Risk %, Entry, Stop Loss</div>
      <div>Features: Visual scale, Presets, Advanced settings</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Vue Flow Node for LotCalculatorView
</script>
