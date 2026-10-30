<script setup lang="ts">
import { ref, computed } from 'vue'
import { calculateLotSize, type OrderType, type AssetType } from '../../utils/lotCalculator'

// State
const orderType = ref<OrderType>('BUY')
const balance = ref<number>(1000)
const riskPercent = ref<number>(1)
const entryPrice = ref<number>(2400)
const stopLossPrice = ref<number>(2395)

// Presets
const balancePresets = [100, 500, 1000, 5000]
const riskPresets = [0.5, 1, 2, 3]

// Advanced Settings
const showAdvanced = ref(false)
const selectedAsset = ref<AssetType>('xauusd')
const contractSize = ref<number>(100) // Default Gold 100 oz
const pointSize = ref<number>(0.01) // 1 point = $0.01 for Gold (5.00 price distance = 500 points)
const minLot = ref<number>(0.01)
const maxLot = ref<number>(100)
const commissionPerLot = ref<number>(0)

// Copy feedback
const copied = ref(false)

// Handle Asset Preset change
const onAssetChange = (asset: AssetType) => {
  selectedAsset.value = asset
  if (asset === 'xauusd') {
    contractSize.value = 100
    pointSize.value = 0.01
    if (entryPrice.value === 1.1 || entryPrice.value === 150) {
      entryPrice.value = 2400
      stopLossPrice.value = 2395
    }
  } else if (asset === 'forex_standard') {
    contractSize.value = 100000
    pointSize.value = 0.00001
    entryPrice.value = 1.08500
    stopLossPrice.value = orderType.value === 'BUY' ? 1.08200 : 1.08800
  } else if (asset === 'forex_jpy') {
    contractSize.value = 100000
    pointSize.value = 0.001
    entryPrice.value = 155.000
    stopLossPrice.value = orderType.value === 'BUY' ? 154.500 : 155.500
  } else if (asset === 'crypto') {
    contractSize.value = 1
    pointSize.value = 1
    entryPrice.value = 65000
    stopLossPrice.value = orderType.value === 'BUY' ? 64000 : 66000
  }
}

// Switch order type and optionally adjust SL if it conflicts
const setOrderType = (type: OrderType) => {
  orderType.value = type
  if (entryPrice.value && stopLossPrice.value) {
    const dist = Math.abs(entryPrice.value - stopLossPrice.value)
    if (type === 'BUY' && stopLossPrice.value >= entryPrice.value) {
      stopLossPrice.value = Number((entryPrice.value - dist).toFixed(4))
    } else if (type === 'SELL' && stopLossPrice.value <= entryPrice.value) {
      stopLossPrice.value = Number((entryPrice.value + dist).toFixed(4))
    }
  }
}

// Calculations via dedicated domain utility
const calculation = computed(() => {
  return calculateLotSize({
    balance: balance.value,
    riskPercent: riskPercent.value,
    entryPrice: entryPrice.value,
    stopLossPrice: stopLossPrice.value,
    contractSize: contractSize.value,
    pointSize: pointSize.value,
    minLot: minLot.value,
    maxLot: maxLot.value,
    commissionPerLot: commissionPerLot.value
  })
})

const riskAmount = computed(() => calculation.value.riskAmount)
const priceDistance = computed(() => calculation.value.priceDistance)
const stopLossPoints = computed(() => calculation.value.stopLossPoints)
const lossPerOneLot = computed(() => calculation.value.lossPerOneLot)
const recommendedLot = computed(() => calculation.value.recommendedLot)
const realRiskAmount = computed(() => calculation.value.realRiskAmount)
const realRiskPercent = computed(() => calculation.value.realRiskPercent)
const isValid = computed(() => calculation.value.isValid)
const validationError = computed(() => calculation.value.validationError)

// Risk status indicator
const riskStatus = computed(() => {
  const r = Number(riskPercent.value) || 0
  if (r <= 1.0) {
    return {
      label: 'อยู่ในระดับระมัดระวัง',
      dotColor: 'bg-emerald-500',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    }
  } else if (r <= 2.5) {
    return {
      label: 'อยู่ในระดับปานกลาง',
      dotColor: 'bg-amber-500',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200'
    }
  } else {
    return {
      label: 'ความเสี่ยงสูง ควรระวัง',
      dotColor: 'bg-red-500',
      badgeClass: 'bg-red-50 text-red-800 border-red-200'
    }
  }
})

// Visual scale position
const scalePositions = computed(() => {
  const entry = Number(entryPrice.value) || 0
  const sl = Number(stopLossPrice.value) || 0
  const minP = Math.min(entry, sl)
  const maxP = Math.max(entry, sl)
  const diff = maxP - minP || 1

  return {
    entryPct: orderType.value === 'BUY' ? 82 : 18,
    slPct: orderType.value === 'BUY' ? 18 : 82,
    minP,
    maxP,
    diff
  }
})

// Reset to defaults
const resetForm = () => {
  orderType.value = 'BUY'
  balance.value = 1000
  riskPercent.value = 1
  entryPrice.value = 2400
  stopLossPrice.value = 2395
  selectedAsset.value = 'xauusd'
  contractSize.value = 100
  pointSize.value = 0.01
}

// Copy to clipboard
const copyLot = async () => {
  try {
    await navigator.clipboard.writeText(recommendedLot.value.toFixed(2))
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy lot size:', err)
  }
}

// Formatters
const formatCurrency = (val: number) => {
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatNumber = (val: number) => {
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}
</script>

<template>
  <div class="w-full min-h-full bg-[#FAF7F5] py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight">
            คำนวณ Lot ก่อนเข้าเทรด
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            กำหนดเงินที่ยอมเสี่ยงและตำแหน่ง Stop Loss แล้วให้ระบบช่วยหาขนาด Lot ที่ไม่ปัดความเสี่ยงขึ้น
          </p>
        </div>

        <!-- Top Right Risk Status Badge -->
        <div class="self-start sm:self-auto">
          <div
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-2xs"
            :class="riskStatus.badgeClass"
          >
            <span class="w-2 h-2 rounded-full" :class="riskStatus.dotColor"></span>
            <span>{{ riskStatus.label }}</span>
          </div>
        </div>
      </div>

      <!-- Main Dual-Card Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Left Card: Input Parameters -->
        <div class="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-[#EFEAE6] shadow-sm flex flex-col gap-6">
          <!-- BUY / SELL Switch Toggle -->
          <div class="flex items-center">
            <div class="inline-flex p-1 rounded-full bg-[#F5EFEA] border border-[#ECE5E0]">
              <button
                type="button"
                @click="setOrderType('BUY')"
                :class="[
                  'px-7 py-2 rounded-full text-xs font-bold transition-all cursor-pointer select-none',
                  orderType === 'BUY'
                    ? 'bg-[#8E444E] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                BUY
              </button>
              <button
                type="button"
                @click="setOrderType('SELL')"
                :class="[
                  'px-7 py-2 rounded-full text-xs font-bold transition-all cursor-pointer select-none',
                  orderType === 'SELL'
                    ? 'bg-[#8E444E] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                SELL
              </button>
            </div>
          </div>

          <!-- Inputs Grid: Balance & Risk -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Account Balance -->
            <div>
              <div class="flex items-center gap-1 mb-1.5">
                <label class="block text-xs font-bold text-gray-700">Account Balance</label>
                <i
                  class="ph ph-info text-gray-400 text-xs cursor-pointer"
                  title="ยอดเงินทุนในพอร์ตการเทรดของคุณ (USD)"
                ></i>
              </div>
              <div class="relative flex items-center">
                <span class="absolute left-3.5 text-sm font-bold text-gray-400 select-none">$</span>
                <input
                  type="number"
                  step="any"
                  v-model.number="balance"
                  placeholder="1000"
                  class="w-full pl-8 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-2xl text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E444E]/20 focus:border-[#8E444E] transition-all"
                />
              </div>
            </div>

            <!-- Risk per Trade -->
            <div>
              <div class="flex items-center gap-1 mb-1.5">
                <label class="block text-xs font-bold text-gray-700">Risk per Trade</label>
                <i
                  class="ph ph-info text-gray-400 text-xs cursor-pointer"
                  title="เปอร์เซ็นต์ความเสี่ยงที่ยอมรับได้ต่อไม้นี้ เช่น 1%"
                ></i>
              </div>
              <div class="relative flex items-center">
                <input
                  type="number"
                  step="0.1"
                  v-model.number="riskPercent"
                  placeholder="1"
                  class="w-full pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-2xl text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E444E]/20 focus:border-[#8E444E] transition-all"
                />
                <span class="absolute right-3.5 text-sm font-bold text-gray-400 select-none">%</span>
              </div>
            </div>
          </div>

          <!-- Inputs Grid: Entry Price & Stop Loss Price -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Entry Price -->
            <div>
              <div class="flex items-center gap-1 mb-1.5">
                <label class="block text-xs font-bold text-gray-700">Entry Price</label>
                <i
                  class="ph ph-info text-gray-400 text-xs cursor-pointer"
                  title="ระดับราคาที่ต้องการเปิดออเดอร์"
                ></i>
              </div>
              <input
                type="number"
                step="any"
                v-model.number="entryPrice"
                placeholder="2400"
                class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E444E]/20 focus:border-[#8E444E] transition-all"
              />
            </div>

            <!-- Stop Loss Price -->
            <div>
              <div class="flex items-center gap-1 mb-1.5">
                <label class="block text-xs font-bold text-gray-700">Stop Loss Price</label>
                <i
                  class="ph ph-info text-gray-400 text-xs cursor-pointer"
                  title="ระดับราคาตัดขาดทุน (Stop Loss)"
                ></i>
              </div>
              <input
                type="number"
                step="any"
                v-model.number="stopLossPrice"
                placeholder="2395"
                class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E444E]/20 focus:border-[#8E444E] transition-all"
              />
            </div>
          </div>

          <!-- Quick Preset Chips -->
          <div class="flex flex-col gap-3 pt-1">
            <!-- Balance Presets -->
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[11px] font-bold text-gray-400 tracking-wider uppercase w-16">
                BALANCE
              </span>
              <button
                v-for="b in balancePresets"
                :key="b"
                type="button"
                @click="balance = b"
                :class="[
                  'px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none',
                  balance === b
                    ? 'bg-[#F7EBEB] text-[#8E444E] border border-[#DFBAC0] font-bold shadow-2xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                ]"
              >
                ${{ b.toLocaleString() }}
              </button>
            </div>

            <!-- Risk Presets -->
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[11px] font-bold text-gray-400 tracking-wider uppercase w-16">
                RISK
              </span>
              <button
                v-for="r in riskPresets"
                :key="r"
                type="button"
                @click="riskPercent = r"
                :class="[
                  'px-3.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none',
                  riskPercent === r
                    ? 'bg-[#F7EBEB] text-[#8E444E] border border-[#DFBAC0] font-bold shadow-2xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                ]"
              >
                {{ r }}%
              </button>
            </div>
          </div>

          <!-- Visual Price Scale & Plan Representation -->
          <div class="p-4 bg-[#FBF9F8] rounded-2xl border border-[#EFEAE6] flex flex-col items-center">
            <!-- The visual track -->
            <div class="w-full relative py-6 px-4">
              <!-- Horizontal Line -->
              <div class="w-full h-1 bg-[#E8DDD8] rounded-full relative">
                <!-- Highlighted range between SL and Entry -->
                <div
                  class="absolute h-full bg-[#8E444E]/30 rounded-full"
                  :style="{
                    left: `${Math.min(scalePositions.slPct, scalePositions.entryPct)}%`,
                    width: `${Math.abs(scalePositions.entryPct - scalePositions.slPct)}%`
                  }"
                ></div>
              </div>

              <!-- SL Marker Point -->
              <div
                class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center select-none"
                :style="{ left: `${scalePositions.slPct}%` }"
              >
                <span class="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                  SL
                </span>
                <span class="text-xs font-bold text-gray-900 mb-1">
                  {{ formatNumber(stopLossPrice) }}
                </span>
                <div class="w-3.5 h-3.5 rounded-full bg-gray-800 ring-4 ring-white shadow-xs"></div>
              </div>

              <!-- ENTRY Marker Point -->
              <div
                class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center select-none"
                :style="{ left: `${scalePositions.entryPct}%` }"
              >
                <span class="text-[10px] font-extrabold text-[#8E444E] uppercase tracking-wider mb-1">
                  ENTRY
                </span>
                <span class="text-xs font-bold text-gray-900 mb-1">
                  {{ formatNumber(entryPrice) }}
                </span>
                <div class="w-3.5 h-3.5 rounded-full bg-[#8E444E] ring-4 ring-white shadow-xs"></div>
              </div>
            </div>

            <!-- Distance Subtitle -->
            <span class="text-xs font-bold text-gray-600 tracking-wide mt-1">
              {{ orderType }} PLAN · ระยะห่าง {{ formatNumber(priceDistance) }}
            </span>
          </div>

          <!-- Advanced Settings Accordion -->
          <div class="border-t border-gray-100 pt-4">
            <button
              type="button"
              @click="showAdvanced = !showAdvanced"
              class="w-full flex items-center justify-between text-xs font-bold text-gray-700 hover:text-gray-900 transition-colors cursor-pointer select-none"
            >
              <span class="flex items-center gap-1.5">
                <i class="ph ph-sliders-horizontal text-base text-gray-500"></i>
                ตั้งค่าขั้นสูง
              </span>
              <span class="text-xs text-gray-400 hover:text-gray-600">
                {{ showAdvanced ? 'ซ่อน' : 'แสดง' }}
              </span>
            </button>

            <!-- Collapsible Settings Body -->
            <div v-if="showAdvanced" class="mt-4 pt-4 border-t border-dashed border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Asset Presets -->
              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-gray-600 mb-1.5">
                  ประเภทสินทรัพย์ (Asset Preset)
                </label>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    @click="onAssetChange('xauusd')"
                    :class="[
                      'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all text-center',
                      selectedAsset === 'xauusd'
                        ? 'bg-[#8E444E] text-white border-[#8E444E]'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    ]"
                  >
                    ทองคำ (XAUUSD)
                  </button>
                  <button
                    type="button"
                    @click="onAssetChange('forex_standard')"
                    :class="[
                      'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all text-center',
                      selectedAsset === 'forex_standard'
                        ? 'bg-[#8E444E] text-white border-[#8E444E]'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    ]"
                  >
                    Forex Standard
                  </button>
                  <button
                    type="button"
                    @click="onAssetChange('forex_jpy')"
                    :class="[
                      'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all text-center',
                      selectedAsset === 'forex_jpy'
                        ? 'bg-[#8E444E] text-white border-[#8E444E]'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    ]"
                  >
                    Forex JPY
                  </button>
                  <button
                    type="button"
                    @click="onAssetChange('crypto')"
                    :class="[
                      'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all text-center',
                      selectedAsset === 'crypto'
                        ? 'bg-[#8E444E] text-white border-[#8E444E]'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    ]"
                  >
                    Crypto
                  </button>
                </div>
              </div>

              <!-- Contract Size -->
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">
                  ขนาดสัญญา (Contract Size)
                </label>
                <input
                  type="number"
                  v-model.number="contractSize"
                  class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E444E]/20"
                />
              </div>

              <!-- Point Value / Size -->
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">
                  ขนาด 1 Point (Point Size)
                </label>
                <input
                  type="number"
                  step="any"
                  v-model.number="pointSize"
                  class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E444E]/20"
                />
              </div>

              <!-- Min Lot -->
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">
                  ขนาด Lot ขั้นต่ำ (Min Lot)
                </label>
                <input
                  type="number"
                  step="0.01"
                  v-model.number="minLot"
                  class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E444E]/20"
                />
              </div>

              <!-- Commission per lot -->
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">
                  ค่าคอมมิชชั่น / Lot ($)
                </label>
                <input
                  type="number"
                  step="any"
                  v-model.number="commissionPerLot"
                  placeholder="0.00"
                  class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E444E]/20"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Right Card: Calculation Results -->
        <div class="lg:col-span-5 flex flex-col gap-3">
          <div class="bg-[#FAF4F4] p-6 sm:p-7 rounded-3xl border border-[#F2E4E4] flex flex-col justify-between gap-6 shadow-sm">
            <!-- Header Row -->
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-[#8E444E] uppercase tracking-wider">
                LOT ที่แนะนำ
              </span>

              <div class="flex items-center gap-2">
                <!-- Copy Button -->
                <button
                  type="button"
                  @click="copyLot"
                  class="px-3 py-1.5 rounded-xl bg-white border border-[#E8DCD8] hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs select-none"
                  :title="copied ? 'คัดลอกแล้ว!' : 'คัดลอกขนาด Lot'"
                >
                  <i :class="copied ? 'ph-bold ph-check text-emerald-600' : 'ph ph-copy text-gray-500'"></i>
                  <span>{{ copied ? 'คัดลอกแล้ว!' : 'Copy' }}</span>
                </button>

                <!-- Reset Button -->
                <button
                  type="button"
                  @click="resetForm"
                  class="px-3 py-1.5 rounded-xl bg-white border border-[#E8DCD8] hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs select-none"
                  title="รีเซ็ตค่าเป็นค่าเริ่มต้น"
                >
                  <i class="ph ph-arrow-counter-clockwise text-gray-500"></i>
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <!-- Big Number Display -->
            <div class="flex items-baseline gap-2 py-1">
              <span class="text-6xl sm:text-7xl font-serif font-black text-gray-900 tracking-tight">
                {{ recommendedLot.toFixed(2) }}
              </span>
              <span class="text-sm font-extrabold text-gray-500 uppercase tracking-widest">
                LOT
              </span>
            </div>

            <!-- Metrics Table 2x2 Grid -->
            <div class="bg-white/80 rounded-2xl border border-[#EBDCDC] divide-y divide-[#EBDCDC] overflow-hidden shadow-2xs">
              <!-- Top Row -->
              <div class="grid grid-cols-2 divide-x divide-[#EBDCDC]">
                <!-- เงินที่ยอมเสี่ยง -->
                <div class="p-3.5 sm:p-4">
                  <span class="text-xs text-gray-500 block mb-1 font-medium">เงินที่ยอมเสี่ยง</span>
                  <span class="text-base sm:text-lg font-bold text-gray-900 block">
                    ${{ formatCurrency(riskAmount) }}
                  </span>
                </div>

                <!-- ระยะ Stop Loss -->
                <div class="p-3.5 sm:p-4">
                  <span class="text-xs text-gray-500 block mb-1 font-medium">ระยะ Stop Loss</span>
                  <span class="text-base sm:text-lg font-bold text-gray-900 block">
                    {{ stopLossPoints.toLocaleString() }} Point
                  </span>
                </div>
              </div>

              <!-- Bottom Row -->
              <div class="grid grid-cols-2 divide-x divide-[#EBDCDC]">
                <!-- ขาดทุนต่อ 1 Lot -->
                <div class="p-3.5 sm:p-4">
                  <span class="text-xs text-gray-500 block mb-1 font-medium">ขาดทุนต่อ 1 Lot</span>
                  <span class="text-base sm:text-lg font-bold text-gray-900 block">
                    ${{ formatCurrency(lossPerOneLot) }}
                  </span>
                </div>

                <!-- ความเสี่ยงจริง -->
                <div class="p-3.5 sm:p-4">
                  <span class="text-xs text-gray-500 block mb-1 font-medium">ความเสี่ยงจริง</span>
                  <span class="text-base sm:text-lg font-bold text-gray-900 block">
                    ${{ formatCurrency(realRiskAmount) }}
                  </span>
                  <span class="text-xs font-bold text-[#8E444E] block mt-0.5">
                    {{ realRiskPercent.toFixed(2) }}%
                  </span>
                </div>
              </div>
            </div>

            <!-- Narrative Callout Summary Box -->
            <div class="border-l-3 border-[#8E444E] bg-white/70 p-3.5 rounded-r-xl text-xs text-gray-700 leading-relaxed shadow-2xs">
              <span v-if="isValid && recommendedLot > 0">
                หากคุณเปิด <strong class="text-gray-900 font-extrabold">{{ recommendedLot.toFixed(2) }} Lot</strong> และราคาชน Stop Loss คุณจะขาดทุนประมาณ <strong class="text-gray-900 font-extrabold">${{ formatCurrency(realRiskAmount) }}</strong> หรือประมาณ <strong class="text-[#8E444E] font-extrabold">{{ realRiskPercent.toFixed(2) }}%</strong> ของพอร์ต
              </span>
              <span v-else-if="!isValid && validationError" class="text-amber-700 font-bold">
                ⚠️ {{ validationError }}
              </span>
              <span v-else class="text-amber-700 font-bold">
                ⚠️ ขนาด Lot ที่คำนวณได้ต่ำกว่าขนาดขั้นต่ำ ({{ minLot }} Lot) โปรดเพิ่มเงินทุนหรือขยับระยะ Stop Loss
              </span>
            </div>
          </div>

          <!-- Bottom Disclaimer -->
          <p class="text-[11px] text-gray-400 leading-relaxed px-2">
            เครื่องมือนี้จัดทำเพื่อการศึกษาและช่วยวางแผนเบื้องต้น ผลจริงอาจต่างจาก Spread, Commission, Slippage และเงื่อนไขของโบรกเกอร์ การเทรดมีความเสี่ยง โปรดตรวจสอบข้อมูลก่อนส่งคำสั่งทุกครั้ง
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
