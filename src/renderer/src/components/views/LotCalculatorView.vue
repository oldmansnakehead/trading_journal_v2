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
    entryPrice.value = 1.085
    stopLossPrice.value = orderType.value === 'BUY' ? 1.082 : 1.088
  } else if (asset === 'forex_jpy') {
    contractSize.value = 100000
    pointSize.value = 0.001
    entryPrice.value = 155.0
    stopLossPrice.value = orderType.value === 'BUY' ? 154.5 : 155.5
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
      label: 'ความเสี่ยงต่ำ (Conservative)',
      dotColor: 'bg-emerald-500',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
    }
  } else if (r <= 2.5) {
    return {
      label: 'ความเสี่ยงมาตรฐาน (Balanced)',
      dotColor: 'bg-amber-500',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80'
    }
  } else {
    return {
      label: 'ความเสี่ยงสูง (Aggressive)',
      dotColor: 'bg-rose-500',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80'
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

// Formatters
const formatCurrency = (val: number) => {
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatNumber = (val: number) => {
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}
</script>

<template>
  <div class="w-full min-h-screen bg-background p-6 md:p-8 font-sans">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">
            คำนวณขนาดสัญญาและคุมความเสี่ยง (Position Sizing)
          </h1>
          <p class="text-sm text-textSecondary mt-1">
            กำหนดเงินทุนและจุด Stop Loss เพื่อหา Volume สัญญา (Lot Size) ที่ปลอดภัย โดยไม่ให้ผลขาดทุนเกินเพดานความเสี่ยงที่วางไว้
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
        <div class="lg:col-span-7 bg-white p-6 sm:p-7 rounded-2xl border border-gray-200/80 shadow-card flex flex-col gap-6">
          <!-- BUY / SELL Switch Toggle -->
          <div class="flex items-center">
            <div class="inline-flex p-1 rounded-xl bg-gray-100 border border-gray-200">
              <button
                type="button"
                @click="setOrderType('BUY')"
                :class="[
                  'px-6 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
                  orderType === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                BUY
              </button>
              <button
                type="button"
                @click="setOrderType('SELL')"
                :class="[
                  'px-6 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
                  orderType === 'SELL'
                    ? 'bg-rose-600 text-white shadow-2xs'
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
                <label class="block text-xs font-bold text-gray-700">ทุนในพอร์ต (Account Equity)</label>
                <i
                  class="ph ph-info text-gray-400 text-xs cursor-pointer hover:text-gray-600"
                  title="มูลค่าเงินทุนสุทธิในพอร์ตการเทรดที่นำมาใช้คำนวณความเสี่ยง (USD)"
                ></i>
              </div>
              <div class="relative flex items-center">
                <span class="absolute left-3.5 text-sm font-bold text-gray-400 select-none">$</span>
                <input
                  type="number"
                  step="any"
                  v-model.number="balance"
                  placeholder="1000"
                  class="w-full pl-8 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-base font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <!-- Risk per Trade -->
            <div>
              <div class="flex items-center gap-1 mb-1.5">
                <label class="block text-xs font-bold text-gray-700">สัดส่วนความเสี่ยง (Risk %)</label>
                <i
                  class="ph ph-info text-gray-400 text-xs cursor-pointer hover:text-gray-600"
                  title="เพดานความเสี่ยงสูงสุดต่อไม้นี้ เทียบเป็น % ของเงินทุน"
                ></i>
              </div>
              <div class="relative flex items-center">
                <input
                  type="number"
                  step="0.1"
                  v-model.number="riskPercent"
                  placeholder="1"
                  class="w-full pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-base font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                <label class="block text-xs font-bold text-gray-700">ราคาเปิดสถานะ (Entry Price)</label>
                <i
                  class="ph ph-info text-gray-400 text-xs cursor-pointer hover:text-gray-600"
                  title="ระดับราคาตามแผนเข้าเทรด"
                ></i>
              </div>
              <input
                type="number"
                step="any"
                v-model.number="entryPrice"
                placeholder="2400"
                class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-base font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <!-- Stop Loss Price -->
            <div>
              <div class="flex items-center gap-1 mb-1.5">
                <label class="block text-xs font-bold text-gray-700">ราคาตัดขาดทุน (Stop Loss)</label>
                <i
                  class="ph ph-info text-gray-400 text-xs cursor-pointer hover:text-gray-600"
                  title="ระดับราคาปิดทำลายมุมมอง (SL Price) เพื่อตัดขาดทุน"
                ></i>
              </div>
              <input
                type="number"
                step="any"
                v-model.number="stopLossPrice"
                placeholder="2395"
                class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-base font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <!-- Quick Preset Chips -->
          <div class="flex flex-col gap-3 pt-1">
            <!-- Balance Presets -->
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[11px] font-bold text-gray-400 tracking-wider uppercase w-20">
                ขนาดพอร์ต
              </span>
              <button
                v-for="b in balancePresets"
                :key="b"
                type="button"
                @click="balance = b"
                :class="[
                  'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none',
                  balance === b
                    ? 'bg-primary/10 text-primary border border-primary/30 font-bold shadow-2xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                ]"
              >
                ${{ b.toLocaleString() }}
              </button>
            </div>

            <!-- Risk Presets -->
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[11px] font-bold text-gray-400 tracking-wider uppercase w-20">
                อัตราเสี่ยง
              </span>
              <button
                v-for="r in riskPresets"
                :key="r"
                type="button"
                @click="riskPercent = r"
                :class="[
                  'px-3.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none',
                  riskPercent === r
                    ? 'bg-primary/10 text-primary border border-primary/30 font-bold shadow-2xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                ]"
              >
                {{ r }}%
              </button>
            </div>
          </div>

          <!-- Visual Price Scale & Plan Representation -->
          <div class="p-4 bg-gray-50/70 rounded-xl border border-gray-200/80 flex flex-col items-center">
            <!-- The visual track -->
            <div class="w-full relative py-6 px-4">
              <!-- Horizontal Line -->
              <div class="w-full h-1.5 bg-gray-200 rounded-full relative">
                <!-- Highlighted range between SL and Entry -->
                <div
                  class="absolute h-full bg-primary/30 rounded-full"
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
                <span class="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">
                  SL
                </span>
                <span class="text-xs font-bold text-gray-900 mb-1">
                  {{ formatNumber(stopLossPrice) }}
                </span>
                <div class="w-3.5 h-3.5 rounded-full bg-rose-500 ring-4 ring-white shadow-2xs"></div>
              </div>

              <!-- ENTRY Marker Point -->
              <div
                class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center select-none"
                :style="{ left: `${scalePositions.entryPct}%` }"
              >
                <span class="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                  ENTRY
                </span>
                <span class="text-xs font-bold text-gray-900 mb-1">
                  {{ formatNumber(entryPrice) }}
                </span>
                <div class="w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-white shadow-2xs"></div>
              </div>
            </div>

            <!-- Distance Subtitle -->
            <span class="text-xs font-semibold text-textSecondary tracking-wide mt-1">
              ฝั่ง {{ orderType }} · ระยะ SL ห่าง {{ formatNumber(priceDistance) }} ({{ stopLossPoints.toLocaleString() }} จุด)
            </span>
          </div>

          <!-- Advanced Settings Accordion -->
          <div class="border-t border-gray-100 pt-4">
            <button
              type="button"
              @click="showAdvanced = !showAdvanced"
              class="w-full flex items-center justify-between text-xs font-bold text-gray-700 hover:text-primary transition-colors cursor-pointer select-none"
            >
              <span class="flex items-center gap-1.5">
                <i class="ph ph-sliders-horizontal text-base text-primary"></i>
                กำหนดสเปกสินทรัพย์ & โบรกเกอร์ (Broker Specs)
              </span>
              <span class="text-xs text-textSecondary hover:text-gray-800">
                {{ showAdvanced ? 'ย่อเก็บ' : 'ดูรายละเอียด' }}
              </span>
            </button>

            <!-- Collapsible Settings Body -->
            <div v-if="showAdvanced" class="mt-4 pt-4 border-t border-dashed border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Asset Presets -->
              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-gray-600 mb-1.5">
                  คู่เงิน / สินทรัพย์อ้างอิง
                </label>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    @click="onAssetChange('xauusd')"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer',
                      selectedAsset === 'xauusd'
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    ]"
                  >
                    ทองคำ (XAUUSD)
                  </button>
                  <button
                    type="button"
                    @click="onAssetChange('forex_standard')"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer',
                      selectedAsset === 'forex_standard'
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    ]"
                  >
                    Forex (EUR/USD)
                  </button>
                  <button
                    type="button"
                    @click="onAssetChange('forex_jpy')"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer',
                      selectedAsset === 'forex_jpy'
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    ]"
                  >
                    Forex JPY (USD/JPY)
                  </button>
                  <button
                    type="button"
                    @click="onAssetChange('crypto')"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer',
                      selectedAsset === 'crypto'
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    ]"
                  >
                    คริปโต (Crypto)
                  </button>
                </div>
              </div>

              <!-- Contract Size -->
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">
                  ขนาดสัญญาต่อ 1.00 Lot (Contract Size)
                </label>
                <input
                  type="number"
                  v-model.number="contractSize"
                  class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <!-- Point Value / Size -->
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">
                  มูลค่าต่อ 1 จุดทศนิยม (Point Size)
                </label>
                <input
                  type="number"
                  step="any"
                  v-model.number="pointSize"
                  class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <!-- Min Lot -->
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">
                  ปริมาณเทรดขั้นต่ำ (Min Lot)
                </label>
                <input
                  type="number"
                  step="0.01"
                  v-model.number="minLot"
                  class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <!-- Commission per lot -->
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">
                  ค่าคอมมิชชั่นสุทธิ / Lot ($)
                </label>
                <input
                  type="number"
                  step="any"
                  v-model.number="commissionPerLot"
                  placeholder="0.00"
                  class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Right Card: Calculation Results -->
        <div class="lg:col-span-5 flex flex-col gap-3">
          <div class="bg-white p-6 sm:p-7 rounded-2xl border border-gray-200/80 shadow-card flex flex-col justify-between gap-6">
            <!-- Header Row -->
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-primary uppercase tracking-wider">
                ขนาดสัญญาที่แนะนำ (Position Size)
              </span>

              <!-- Reset Button -->
              <button
                type="button"
                @click="resetForm"
                class="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs select-none active:scale-95"
                title="รีเซ็ตค่าเป็นค่าเริ่มต้น"
              >
                <i class="ph ph-arrow-counter-clockwise text-gray-500"></i>
                <span>Reset</span>
              </button>
            </div>

            <!-- Big Number Display -->
            <div class="flex items-baseline gap-2 py-1">
              <span class="text-6xl sm:text-7xl font-sans font-black text-gray-900 tracking-tight">
                {{ recommendedLot.toFixed(2) }}
              </span>
              <span class="text-sm font-extrabold text-gray-400 uppercase tracking-widest">
                LOT
              </span>
            </div>

            <!-- Metrics Table 2x2 Grid -->
            <div class="bg-gray-50/70 rounded-xl border border-gray-200/80 divide-y divide-gray-200/80 overflow-hidden shadow-2xs">
              <!-- Top Row -->
              <div class="grid grid-cols-2 divide-x divide-gray-200/80">
                <!-- งบขาดทุนสูงสุดที่ยอมรับได้ -->
                <div class="p-3.5 sm:p-4">
                  <span class="text-xs text-textSecondary block mb-1 font-medium">งบขาดทุนสูงสุดที่ยอมรับได้</span>
                  <span class="text-base sm:text-lg font-bold text-gray-900 block">
                    ${{ formatCurrency(riskAmount) }}
                  </span>
                </div>

                <!-- ระยะห่างถึงจุด SL -->
                <div class="p-3.5 sm:p-4">
                  <span class="text-xs text-textSecondary block mb-1 font-medium">ระยะห่างถึงจุด SL</span>
                  <span class="text-base sm:text-lg font-bold text-gray-900 block">
                    {{ stopLossPoints.toLocaleString() }} จุด
                  </span>
                </div>
              </div>

              <!-- Bottom Row -->
              <div class="grid grid-cols-2 divide-x divide-gray-200/80">
                <!-- มูลค่าขาดทุนต่อ 1 Lot -->
                <div class="p-3.5 sm:p-4">
                  <span class="text-xs text-textSecondary block mb-1 font-medium">มูลค่าขาดทุนต่อ 1.00 Lot</span>
                  <span class="text-base sm:text-lg font-bold text-gray-900 block">
                    ${{ formatCurrency(lossPerOneLot) }}
                  </span>
                </div>

                <!-- ความเสี่ยงสุทธิเมื่อโดน SL -->
                <div class="p-3.5 sm:p-4">
                  <span class="text-xs text-textSecondary block mb-1 font-medium">ความเสี่ยงสุทธิเมื่อโดน SL</span>
                  <span class="text-base sm:text-lg font-bold text-gray-900 block">
                    ${{ formatCurrency(realRiskAmount) }}
                  </span>
                  <span class="text-xs font-bold text-primary block mt-0.5">
                    {{ realRiskPercent.toFixed(2) }}% ของพอร์ต
                  </span>
                </div>
              </div>
            </div>

            <!-- Narrative Callout Summary Box -->
            <div class="border-l-4 border-primary bg-primary/5 p-4 rounded-r-xl text-xs text-textPrimary leading-relaxed shadow-2xs">
              <span v-if="isValid && recommendedLot > 0">
                สรุปแผน: หากเปิดสถานะ <strong class="text-gray-900 font-extrabold">{{ recommendedLot.toFixed(2) }} Lot</strong> แล้วราคาเคลื่อนที่ไปแตะ Stop Loss พอร์ตจะเสียประมาณ <strong class="text-gray-900 font-extrabold">${{ formatCurrency(realRiskAmount) }}</strong> คิดเป็น <strong class="text-primary font-extrabold">{{ realRiskPercent.toFixed(2) }}%</strong> ของเงินทุน ซึ่งไม่เกินขอบเขตความเสี่ยงที่ตั้งไว้
              </span>
              <span v-else-if="!isValid && validationError" class="text-rose-600 font-bold">
                ⚠️ {{ validationError }}
              </span>
              <span v-else class="text-amber-700 font-bold">
                ⚠️ ขนาดสัญญาที่คำนวณได้ต่ำกว่าปริมาณขั้นต่ำของโบรกเกอร์ ({{ minLot }} Lot) โปรดเพิ่มเงินทุนหรือขยับระยะ Stop Loss ให้กว้างขึ้น
              </span>
            </div>
          </div>

          <!-- Bottom Disclaimer -->
          <p class="text-[11px] text-gray-400 leading-relaxed px-2">
            หมายเหตุ: เครื่องมือนี้ใช้สำหรับวางแผน Position Sizing เชิงสถิติเพื่อจำกัด Drawdown ผลลัพธ์จริงอาจมีความคลาดเคลื่อนเล็กน้อยจากค่า Spread, Commission และ Slippage ในตลาดจริง โปรดตรวจสอบรายละเอียดคำสั่งก่อนเข้าเทรดจริงเสมอ
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
