<template>
  <div class="bg-white border-2 border-[#8E444E] rounded-xl p-3 shadow-md w-[280px]">
    <div class="font-bold text-sm mb-2 text-[#8E444E] flex items-center gap-2">
      <i class="ph ph-calculator text-base"></i>
      LotCalculatorView
    </div>
    <div class="text-xs text-gray-600 mb-2 leading-relaxed">
      Pre-trade position sizing calculator. Computes exact lot size based on account balance, risk %, and stop loss distance with conservative floor rounding.
    </div>
    <div class="flex flex-col gap-1 text-[10px] text-gray-500 bg-[#FAF7F5] p-2 rounded-lg border border-[#EFEAE6]">
      <div>Mode: BUY / SELL</div>
      <div>Inputs: Balance, Risk %, Entry, Stop Loss</div>
      <div>Features: Visual scale, Presets, Advanced settings</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Vue Flow Node for LotCalculatorView
</script>
