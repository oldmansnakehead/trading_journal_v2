<template>
  <div ref="dashboardRef" class="p-8 w-full mx-auto bg-gray-50/50 min-h-screen">
    <!-- Header & Mode Switcher -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-1">Reports & Dashboard</h1>
        <p class="text-gray-500 text-sm">Analyze your trading performance and KPIs.</p>
      </div>

      <!-- Header Actions -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Export Image Button -->
        <button
          @click="captureDashboard"
          :disabled="isCapturing"
          class="export-exclude inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-xl border border-gray-200 shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:border-gray-300 active:scale-95"
          title="Capture and export full dashboard as image"
        >
          <!-- Loading Spinner -->
          <svg
            v-if="isCapturing"
            class="animate-spin h-4 w-4 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <!-- Camera / Picture Icon -->
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-gray-600"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
          <span>{{ isCapturing ? 'Exporting...' : 'Export Image' }}</span>
        </button>

        <!-- Mode Switcher -->
        <div
          class="bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm flex font-semibold text-sm"
        >
          <button
            @click="statMode = 'normal'"
            :class="[
              'px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap',
              statMode === 'normal'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            ]"
          >
            Normal RR
          </button>
          <button
            @click="statMode = 'be'"
            :class="[
              'px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap',
              statMode === 'be'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            ]"
          >
            Break Even
          </button>
          <button
            @click="statMode = 'trail'"
            :class="[
              'px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap',
              statMode === 'trail'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            ]"
          >
            Trail + BE
          </button>
        </div>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col gap-5">
      <!-- Top Row: Primary Filters -->
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex items-center gap-2 text-gray-500 mr-2 h-[38px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span class="font-bold text-sm">Filters:</span>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-gray-500">Setup</label>
          <BaseSelect
            v-model="filters.setup"
            :options="[{ label: 'All Setups', value: 'all' }, ...setups.map((s) => ({ label: s.name, value: s.id }))]"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-gray-500">Symbol</label>
          <BaseSelect
            v-model="filters.symbol"
            :options="[{ label: 'All Symbols', value: 'all' }, ...symbols.map((s) => ({ label: s.name, value: s.id }))]"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-gray-500">Session</label>
          <BaseSelect
            v-model="filters.session"
            :options="availableSessions"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-gray-500">Type</label>
          <BaseSelect
            v-model="filters.tradeType"
            :options="[
              { label: 'All Trades', value: 'all' },
              { label: 'Real Trades', value: 'real' },
              { label: 'Paper / Test', value: 'test' }
            ]"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-gray-500">From</label>
          <input
            type="date"
            v-model="filters.startDate"
            class="w-32 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-blue-500"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-gray-500">To</label>
          <input
            type="date"
            v-model="filters.endDate"
            class="w-32 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <!-- Middle Row: Custom Columns -->
      <div v-if="reportCustomColumns.length > 0" class="flex flex-wrap gap-4 items-end pt-5 border-t border-gray-100">
        <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 h-[38px] flex items-center">Custom</div>
        <template v-for="col in reportCustomColumns" :key="col.id">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-500">{{ col.name }}</label>
            <BaseSelect
              v-if="col.type === 'single_selector' || col.type === 'multiple_selector'"
              v-model="filters.customFields[col.id]"
              :options="[{label: 'All', value: 'all'}, ...(typeof col.options === 'string' ? JSON.parse(col.options) : (col.options || [])).map(o => ({label: o, value: o}))]"
            />
            <BaseSelect
              v-else-if="col.type === 'switch' || col.type === 'checkbox'"
              v-model="filters.customFields[col.id]"
              :options="[{label: 'All', value: 'all'}, {label: 'Yes', value: 'true'}, {label: 'No', value: 'false'}]"
            />
            <input
              v-else-if="col.type === 'string'"
              type="text"
              v-model="filters.customFields[col.id]"
              :placeholder="'Filter...'"
              class="w-32 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-blue-500"
            />
            <input
              v-else-if="col.type === 'number'"
              type="number"
              step="any"
              v-model="filters.customFields[col.id]"
              :placeholder="'Filter...'"
              class="w-32 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-blue-500"
            />
          </div>
        </template>
      </div>

      <!-- Bottom Row: Simulation -->
      <div class="flex flex-wrap gap-4 items-end pt-5 border-t border-gray-100">
        <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 h-[38px] flex items-center">Simulation</div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-gray-500">Capital $</label>
          <input
            type="number"
            min="0"
            v-model.number="simulation.initialBalance"
            class="w-28 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-blue-500 font-semibold"
            placeholder="10000"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-gray-500">Risk %</label>
          <input
            type="number"
            min="0"
            step="0.1"
            v-model.number="simulation.riskPerTrade"
            class="w-20 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-blue-500 font-semibold"
            placeholder="1"
          />
        </div>

        <!-- Return Calculation (Simple vs Log Compounded) -->
        <div class="flex flex-col gap-1">
          <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Return Calculation</label>
          <div class="bg-gray-100 p-1 rounded-xl flex font-semibold text-xs border border-gray-200/60 shadow-2xs">
            <button
              type="button"
              @click="simulation.returnCalculation = 'simple'"
              :class="[
                'px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer',
                simulation.returnCalculation === 'simple'
                  ? 'bg-white text-gray-900 shadow-sm font-bold'
                  : 'text-gray-500 hover:text-gray-800'
              ]"
            >
              Simple
            </button>
            <button
              type="button"
              @click="simulation.returnCalculation = 'log'"
              :class="[
                'px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer',
                simulation.returnCalculation === 'log'
                  ? 'bg-white text-gray-900 shadow-sm font-bold'
                  : 'text-gray-500 hover:text-gray-800'
              ]"
            >
              Log (Compounded)
            </button>
          </div>
        </div>

        <button
          @click="resetFilters"
          class="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors ml-auto flex items-center gap-1 h-[38px] cursor-pointer"
        >
          <i class="ph-bold ph-x"></i> Clear All Filters
        </button>
      </div>
    </div>

    <!-- KPIs Row (Cards) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
      <PastelStatCard
        title="Total Trades"
        :value="kpis.totalTrades"
        :trend="kpis.totalTrades"
        icon="ph-chart-bar"
        color="info"
        infoTitle="Total Trades (จำนวนไม้ทั้งหมด)"
        infoDescription="จำนวนออเดอร์ทั้งหมดที่เปิดและบันทึกในระบบตามตัวกรองปัจจุบัน ใช้ดูขนาดกลุ่มตัวอย่างเพื่อความแม่นยำทางสถิติ"
        infoFormula="นับจำนวนรายการออเดอร์ทั้งหมดในตัวกรอง"
      />
      <PastelStatCard
        title="Win Rate"
        :value="kpis.winRate + '%'"
        :trend="kpis.winRate"
        icon="ph-check-circle"
        color="success"
        infoTitle="Win Rate (อัตราการชนะ)"
        infoDescription="สัดส่วนเปอร์เซ็นต์ของไม้ที่ชนะ (RR > 0) บ่งบอกความแม่นยำของจุดเข้าเทรด ช่วยวิเคราะห์ความสม่ำเสมอของระบบ"
        infoFormula="(จำนวนไม้ชนะ ÷ จำนวนไม้ทั้งหมด) × 100%"
      />
      <PastelStatCard
        title="Average RR"
        :value="kpis.avgRr + 'R'"
        :trend="kpis.avgRr"
        icon="ph-trend-up"
        color="primary"
        infoTitle="Average RR (ผลตอบแทนคาดหวังเฉลี่ย)"
        infoDescription="ค่าเฉลี่ยผลตอบแทนต่อความเสี่ยงสุทธิต่อไม้ (Expectancy in R) ถ้ามีค่าเป็นบวกแสดงว่าระบบมีความได้เปรียบทางสถิติในระยะยาว"
        infoFormula="ผลรวม RR สุทธิทั้งหมด ÷ จำนวนไม้ทั้งหมด"
      />
      <PastelStatCard
        title="Max Drawdown"
        :value="kpis.maxDrawdown + '%'"
        :trend="kpis.maxDrawdown > 0 ? -kpis.maxDrawdown : 0"
        icon="ph-warning"
        color="warning"
        infoTitle="Max Drawdown (การติดลบสูงสุด)"
        infoDescription="เปอร์เซ็นต์ที่พอร์ตยุบตัวลงลึกที่สุดจากจุดสูงสุด (Peak to Trough) ใช้ประเมินความเสี่ยงสูงสุดเพื่อวางแผนคุมขนาดล็อต"
        infoFormula="((ยอดพอร์ตสูงสุด - ยอดต่ำสุดหลังจุดสูงสุด) ÷ ยอดพอร์ตสูงสุด) × 100%"
      />
    </div>

    <!-- PnL & Financials Row -->
    <div class="mb-8 bg-gradient-to-r from-gray-50 via-white to-gray-50 p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <i class="ph-bold ph-coins text-lg"></i>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h2 class="text-base font-bold text-gray-900">
                สถิติกระแสเงิน (PnL & Financials)
              </h2>
              <InfoTooltip
                title="สถิติกระแสเงิน (PnL & Financials)"
                description="ภาพรวมทางการเงินของพอร์ต แสดงผลกำไรขาดทุนสุทธิ ยอดเงินคงเหลือล่าสุด อัตราส่วนความคุ้มค่า และค่าเฉลี่ยต่อไม้"
                formula="NET PNL = GROSS PROFIT - GROSS LOSS"
              />
            </div>
            <p class="text-xs text-gray-500">
              คำนวณตามโหมด {{ statMode.toUpperCase() }} ({{ simulation.returnCalculation === 'simple' ? 'Simple Fixed Risk' : 'Log Compounded' }})
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
            NET PNL = GROSS PROFIT - GROSS LOSS
          </span>
          <span class="text-xs font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
            PROFIT FACTOR = GROSS PROFIT / GROSS LOSS
          </span>
        </div>
      </div>

      <!-- Primary Financials & Balance (Row 1) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <!-- GROSS PROFIT -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-xs flex items-center justify-between gap-3 min-w-0 relative group hover:z-30 hover:border-emerald-300 transition-all">
          <div class="relative z-10 min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5 mb-1">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap shrink-0">GROSS PROFIT</p>
              <InfoTooltip
                title="Gross Profit (กำไรรวม)"
                description="จำนวนเงินกำไรทั้งหมดที่ทำได้ นำเฉพาะไม้ที่เทรดชนะ (Wins) มารวมกัน บ่งบอกพลังในการสร้างกำไรของระบบเมื่อตลาดเป็นใจ"
                formula="ผลรวมกำไร ($) ของไม้ชนะทั้งหมด"
              />
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-0.5 truncate">
              +${{ kpis.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </p>
            <p class="text-xs text-emerald-700/80 mt-1 font-medium flex items-center gap-1.5 truncate">
              <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span class="truncate">กำไรรวมจากไม้ชนะ ({{ kpis.wins }} ไม้)</span>
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg sm:text-xl shrink-0 group-hover:scale-105 transition-transform">
            <i class="ph-bold ph-arrow-circle-up"></i>
          </div>
        </div>

        <!-- GROSS LOSS -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-xs flex items-center justify-between gap-3 min-w-0 relative group hover:z-30 hover:border-rose-300 transition-all">
          <div class="relative z-10 min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5 mb-1">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap shrink-0">GROSS LOSS</p>
              <InfoTooltip
                title="Gross Loss (ขาดทุนรวม)"
                description="จำนวนเงินขาดทุนทั้งหมด นำเฉพาะไม้ที่เทรดแพ้ (Losses) มารวมกัน แสดงถึงความเสียหายรวมที่เกิดขึ้นเมื่อตลาดวิ่งผิดทาง"
                formula="ผลรวมขาดทุน ($) ของไม้แพ้ทั้งหมด"
              />
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-rose-600 mt-0.5 truncate">
              -${{ kpis.grossLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </p>
            <p class="text-xs text-rose-700/80 mt-1 font-medium flex items-center gap-1.5 truncate">
              <span class="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
              <span class="truncate">ขาดทุนรวมจากไม้แพ้ ({{ kpis.losses }} ไม้)</span>
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg sm:text-xl shrink-0 group-hover:scale-105 transition-transform">
            <i class="ph-bold ph-arrow-circle-down"></i>
          </div>
        </div>

        <!-- NET PNL -->
        <div
          class="bg-white rounded-2xl p-4 sm:p-5 border shadow-xs flex items-center justify-between gap-3 min-w-0 relative group hover:z-30 transition-all"
          :class="kpis.netPnl >= 0 ? 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300' : 'border-rose-200 bg-rose-50/20 hover:border-rose-300'"
        >
          <div class="relative z-10 min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5 mb-1">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap shrink-0">NET PNL</p>
              <InfoTooltip
                title="Net PnL (กำไรสุทธิ)"
                description="กำไรหรือขาดทุนสุทธิที่แท้จริงหลังจากหักกลบลบต้นทุนและผลขาดทุนเรียบร้อยแล้ว ถ้าเป็นบวกแสดงว่าระบบมีกำไรและพอร์ตเติบโต"
                formula="GROSS PROFIT - GROSS LOSS"
              />
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
                :class="kpis.netPnl >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
              >
                Profit - Loss
              </span>
            </div>
            <p
              class="text-xl sm:text-2xl font-extrabold truncate"
              :class="kpis.netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'"
            >
              {{ kpis.netPnl >= 0 ? '+' : '-' }}${{ Math.abs(kpis.netPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </p>
            <p class="text-xs text-gray-500 mt-1 font-medium truncate">
              ${{ kpis.grossProfit.toFixed(2) }} - ${{ kpis.grossLoss.toFixed(2) }}
            </p>
          </div>
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl shrink-0 group-hover:scale-105 transition-transform"
            :class="kpis.netPnl >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
          >
            <i :class="kpis.netPnl >= 0 ? 'ph-bold ph-wallet' : 'ph-bold ph-trend-down'"></i>
          </div>
        </div>

        <!-- FINAL BALANCE -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-indigo-100 shadow-xs flex items-center justify-between gap-3 min-w-0 relative group hover:z-30 hover:border-indigo-300 transition-all">
          <div class="relative z-10 min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5 mb-1">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap shrink-0">FINAL BALANCE</p>
              <InfoTooltip
                title="Final Balance (ยอดเงินคงเหลือล่าสุด)"
                description="ยอดเงินในพอร์ตปัจจุบันหลังจากการเทรดไม้ล่าสุด ใช้ติดตามขนาดพอร์ตจริงเทียบกับเงินทุนเริ่มต้น"
                formula="ทุนเริ่มต้น + NET PNL"
              />
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap shrink-0">
                Capital + Net PnL
              </span>
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-indigo-600 truncate">
              ${{ kpis.finalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </p>
            <p class="text-xs text-indigo-700/80 mt-1 font-medium flex items-center gap-1.5 truncate">
              <span class="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
              <span class="truncate">ทุน ${{ (Number(simulation.initialBalance) || 10000).toLocaleString() }} {{ kpis.netPnl >= 0 ? '+' : '-' }} ${{ Math.abs(kpis.netPnl).toFixed(2) }}</span>
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg sm:text-xl shrink-0 group-hover:scale-105 transition-transform">
            <i class="ph-bold ph-bank"></i>
          </div>
        </div>
      </div>

      <!-- Trade Efficiency & Per-Trade Statistics (Row 2) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- PROFIT FACTOR -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-amber-100 shadow-xs flex items-center justify-between gap-3 min-w-0 relative group hover:z-30 hover:border-amber-300 transition-all">
          <div class="relative z-10 min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5 mb-1">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap shrink-0">PROFIT FACTOR</p>
              <InfoTooltip
                title="Profit Factor (อัตราความคุ้มค่าของระบบ)"
                description="อัตราส่วนความคุ้มค่า บ่งบอกว่าระบบได้กำไรกี่เท่าของเงินที่เสียไป ถ้ามากกว่า 1.0 ถือว่าระบบทำกำไรได้ (เกิน 1.5 ถือว่าระบบแข็งแกร่งมาก)"
                formula="GROSS PROFIT ÷ GROSS LOSS"
              />
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
                :class="kpis.profitFactor >= 1.0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'"
              >
                {{ kpis.profitFactor >= 1.0 ? '≥ 1.0 ทำกำไรได้' : '< 1.0 ยังไม่คุ้มทุน' }}
              </span>
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-amber-600 truncate">
              {{ kpis.grossLoss === 0 && kpis.grossProfit > 0 ? '∞ (MAX)' : kpis.profitFactor.toFixed(2) }}
            </p>
            <p class="text-xs text-gray-500 mt-1 font-medium truncate" title="Profit / Loss">
              ได้กำไร {{ kpis.grossLoss === 0 && kpis.grossProfit > 0 ? '∞' : kpis.profitFactor.toFixed(2) }} เท่าของที่เสียไป (Profit / Loss)
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg sm:text-xl shrink-0 group-hover:scale-105 transition-transform">
            <i class="ph-bold ph-scales"></i>
          </div>
        </div>

        <!-- AVG WIN $ -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-xs flex items-center justify-between gap-3 min-w-0 relative group hover:z-30 hover:border-emerald-300 transition-all">
          <div class="relative z-10 min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5 mb-1">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap shrink-0">AVG WIN $</p>
              <InfoTooltip
                title="Avg Win $ (กำไรเฉลี่ยต่อไม้ชนะ)"
                description="จำนวนเงินกำไรเฉลี่ยในแต่ละครั้งที่เทรดชนะ ช่วยให้ทราบว่าเวลาชนะจะได้เงินกลับมาเฉลี่ยไม้ละกี่ดอลลาร์"
                formula="GROSS PROFIT ÷ จำนวนไม้ชนะ (Wins)"
              />
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-0.5 truncate">
              +${{ kpis.avgWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </p>
            <p class="text-xs text-emerald-700/80 mt-1 font-medium flex items-center gap-1.5 truncate">
              <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span class="truncate">กำไรเฉลี่ยต่อไม้ชนะ (Profit / {{ kpis.wins }} Wins)</span>
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg sm:text-xl shrink-0 group-hover:scale-105 transition-transform">
            <i class="ph-bold ph-trend-up"></i>
          </div>
        </div>

        <!-- AVG LOSS $ -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-xs flex items-center justify-between gap-3 min-w-0 relative group hover:z-30 hover:border-rose-300 transition-all">
          <div class="relative z-10 min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5 mb-1">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap shrink-0">AVG LOSS $</p>
              <InfoTooltip
                title="Avg Loss $ (ขาดทุนเฉลี่ยต่อไม้แพ้)"
                description="จำนวนเงินขาดทุนเฉลี่ยในแต่ละครั้งที่เทรดแพ้ ช่วยควบคุมความเสียหายไม่ให้ขาดทุนต่อไม้มากเกินไป"
                formula="GROSS LOSS ÷ จำนวนไม้แพ้ (Losses)"
              />
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-rose-600 mt-0.5 truncate">
              -${{ kpis.avgLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </p>
            <p class="text-xs text-rose-700/80 mt-1 font-medium flex items-center gap-1.5 truncate">
              <span class="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
              <span class="truncate">ขาดทุนเฉลี่ยต่อไม้แพ้ (Loss / {{ kpis.losses }} Losses)</span>
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg sm:text-xl shrink-0 group-hover:scale-105 transition-transform">
            <i class="ph-bold ph-trend-down"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Risk:Reward (RR) Statistics Row -->
    <div class="mb-8 bg-gradient-to-r from-gray-50 via-white to-gray-50 p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <i class="ph-bold ph-chart-line-up text-lg"></i>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h2 class="text-base font-bold text-gray-900">
                สถิติผลตอบแทนต่อความเสี่ยง (Risk:Reward - RR)
              </h2>
              <InfoTooltip
                title="สถิติผลตอบแทนต่อความเสี่ยง (Risk:Reward - RR)"
                description="ประเมินความคุ้มค่าของการทำกำไรเทียบความเสี่ยงที่ยอมรับได้ในแต่ละออเดอร์ เพื่อให้แน่ใจว่าระบบมีแต้มต่อ (Edge) ในระยะยาว"
                formula="AVG RR = AVG WIN $ ÷ AVG LOSS $"
              />
            </div>
            <p class="text-xs text-gray-500">
              ประเมินประสิทธิภาพความคุ้มค่าของการทำกำไรเทียบความเสี่ยงตามโหมด {{ statMode.toUpperCase() }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
            TOTAL RR = Σ R (Net)
          </span>
          <span class="text-xs font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
            AVG RR = AVG WIN / AVG LOSS
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <!-- TOTAL RR -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-indigo-100 shadow-xs flex items-center justify-between gap-3 min-w-0 relative group hover:z-30 hover:border-indigo-300 transition-all">
          <div class="relative z-10 min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5 mb-1">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap shrink-0">TOTAL RR</p>
              <InfoTooltip
                title="Total RR (ผลรวม RR สุทธิ)"
                description="ผลรวมของค่า Reward to Risk (R) สุทธิทั้งหมดในพอร์ต โดยนำค่า R ของไม้ชนะบวกกับค่า R ของไม้แพ้ เพื่อดูความคุ้มค่ารวมในหน่วย R-multiple"
                formula="ผลรวมค่า RR ของทุกออเดอร์ (Σ R)"
              />
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
                :class="kpis.totalRr >= 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
              >
                {{ kpis.totalRr >= 0 ? 'Net Positive' : 'Net Negative' }}
              </span>
            </div>
            <p
              class="text-xl sm:text-2xl font-extrabold truncate"
              :class="kpis.totalRr >= 0 ? 'text-indigo-600' : 'text-rose-600'"
            >
              {{ kpis.totalRr >= 0 ? '+' : '' }}{{ kpis.totalRr }}R
            </p>
            <p class="text-xs text-gray-500 mt-1 font-medium truncate" title="ผลรวมของ RR สุทธิทั้งหมดในพอร์ต">
              ผลรวมของ RR สุทธิทั้งหมดในพอร์ต
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg sm:text-xl shrink-0 group-hover:scale-105 transition-transform">
            <i class="ph-bold ph-sigma"></i>
          </div>
        </div>

        <!-- AVG RR -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-xs flex items-center justify-between gap-3 min-w-0 relative group hover:z-30 hover:border-emerald-300 transition-all">
          <div class="relative z-10 min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5 mb-1">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap shrink-0">AVG RR</p>
              <InfoTooltip
                title="Avg RR (Payoff Ratio / อัตราผลตอบแทนเฉลี่ย)"
                description="อัตราส่วนความคุ้มค่าระหว่างไม้ชนะเทียบกับไม้แพ้ บอกว่าเวลาชนะจะได้กำไรกี่เท่าของความเสี่ยงที่เสียไปต่อไม้ (เช่น 1:3 หมายถึงชนะได้ 3R เสียแค่ 1R)"
                formula="AVG WIN $ ÷ AVG LOSS $"
              />
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shrink-0">
                1 : {{ kpis.avgWinLossRr }}
              </span>
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-emerald-600 truncate">
              {{ kpis.avgWinLossRr }}R
            </p>
            <p class="text-xs text-gray-500 mt-1 font-medium truncate" title="กำไร ~{{ kpis.avgWinLossRr }} เท่าของความเสี่ยง (AVG WIN / AVG LOSS)">
              กำไร ~{{ kpis.avgWinLossRr }} เท่าของความเสี่ยง (AVG WIN / AVG LOSS)
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg sm:text-xl shrink-0 group-hover:scale-105 transition-transform">
            <i class="ph-bold ph-scales"></i>
          </div>
        </div>

        <!-- MAX RR -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-purple-100 shadow-xs flex items-center justify-between gap-3 min-w-0 relative group hover:z-30 hover:border-purple-300 transition-all">
          <div class="relative z-10 min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5 mb-1">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap shrink-0">MAX RR</p>
              <InfoTooltip
                title="Max RR (กำไรสูงสุดในไม้เดียว)"
                description="ออเดอร์ที่สามารถรีดกำไรได้สูงสุดแบบสุดขั้วในไม้เดียว แสดงศักยภาพสูงสุดของระบบเมื่อเจอรันเทรนด์ใหญ่"
                formula="ค่า RR สูงสุดที่ทำได้ในออเดอร์เดี่ยว"
              />
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap shrink-0">
                Peak Single Trade
              </span>
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-purple-600 truncate">
              +{{ kpis.maxRr }}R
            </p>
            <p class="text-xs text-purple-700/80 mt-1 font-medium truncate" title="ออเดอร์ที่รีดกำไรได้สูงสุดแบบสุดขั้วในไม้เดียว">
              ออเดอร์ที่รีดกำไรได้สูงสุดแบบสุดขั้วในไม้เดียว
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg sm:text-xl shrink-0 group-hover:scale-105 transition-transform">
            <i class="ph-bold ph-rocket-launch"></i>
          </div>
        </div>

        <!-- AVG MAX RR -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-amber-100 shadow-xs flex items-center justify-between gap-3 min-w-0 relative group hover:z-30 hover:border-amber-300 transition-all">
          <div class="relative z-10 min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5 mb-1">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap shrink-0">AVG MAX RR</p>
              <InfoTooltip
                title="Avg Max RR (ค่าเฉลี่ย RR สูงสุดที่ระบบไปถึง)"
                description="ค่าเฉลี่ยของจุดสูงสุด (Maximum Favorable Excursion - MFE) ที่กราฟวิ่งไปถึงก่อนจะโดนปิดออเดอร์หรือโดน Trailing Stop ช่วยวิเคราะห์ว่าตั้ง TP ใกล้หรือไกลเกินไป"
                formula="ผลรวม Max RR ของแต่ละไม้ ÷ จำนวนไม้"
              />
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap shrink-0">
                Potential MFE
              </span>
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-amber-600 truncate">
              {{ kpis.avgMaxRr }}R
            </p>
            <p class="text-xs text-amber-700/80 mt-1 font-medium truncate" title="ค่าเฉลี่ย RR สูงสุดที่ระบบไปถึงก่อนโดนปิดออเดอร์">
              ค่าเฉลี่ย RR สูงสุดที่ระบบไปถึงก่อนโดนปิดออเดอร์
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg sm:text-xl shrink-0 group-hover:scale-105 transition-transform">
            <i class="ph-bold ph-target"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Streaks & Drawdown Statistics Row -->
    <div class="mb-8 bg-gradient-to-r from-gray-50 via-white to-gray-50 p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <i class="ph-bold ph-shield-warning text-lg"></i>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h2 class="text-base font-bold text-gray-900">
                สถิติความเสี่ยงและการติดลบ (Streaks & Drawdown)
              </h2>
              <InfoTooltip
                title="สถิติความเสี่ยงและการติดลบ (Streaks & Drawdown)"
                description="วิเคราะห์ความเสี่ยง จุดอ่อนของระบบ สถิติการชนะ/แพ้ติดต่อกัน และภาวะพอร์ตยุบตัวสูงสุด เพื่อช่วยเตรียมแผนบริหารจัดการความเสี่ยงและจิตวิทยา"
                formula="DD % = ((Peak - Valley) ÷ Peak) × 100%"
              />
            </div>
            <p class="text-xs text-gray-500">
              วิเคราะห์จุดอ่อน อัตราการแพ้/ชนะติดต่อกัน และภาวะพอร์ตยุบตัวสูงสุด (Peak to Trough)
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
            WIN RATE: {{ kpis.winRate }}%
          </span>
          <span class="text-xs font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
            PEAK TO TROUGH
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- CONSEC. WINS -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-xs flex items-center justify-between gap-3 min-w-0 relative group hover:z-30 hover:border-emerald-300 transition-all">
          <div class="relative z-10 min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5 mb-1">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap shrink-0">CONSEC. WINS</p>
              <InfoTooltip
                title="Consecutive Wins (ชนะติดต่อกันสูงสุด)"
                description="จำนวนไม้ที่เทรดชนะติดต่อกันยาวนานที่สุด (Winning Streak) ใช้ดูช่วงเวลาที่ระบบทำงานได้เข้ากับสภาวะตลาดที่สุด"
                formula="นับจำนวนไม้ชนะต่อเนื่องตามลำดับเวลา"
              />
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shrink-0">
                Winning Streak
              </span>
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-emerald-600 truncate">
              {{ kpis.consecWins }} ไม้
            </p>
            <p class="text-xs text-emerald-700/80 mt-1 font-medium truncate" title="จำนวนครั้งที่เทรดชนะติดต่อกันมากที่สุด">
              จำนวนครั้งที่เทรดชนะติดต่อกันมากที่สุด
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg sm:text-xl shrink-0 group-hover:scale-105 transition-transform">
            <i class="ph-bold ph-trophy"></i>
          </div>
        </div>

        <!-- CONSEC. LOSSES -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-xs flex items-center justify-between gap-3 min-w-0 relative group hover:z-30 hover:border-rose-300 transition-all">
          <div class="relative z-10 min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5 mb-1">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap shrink-0">CONSEC. LOSSES</p>
              <InfoTooltip
                title="Consecutive Losses (แพ้ติดต่อกันสูงสุด)"
                description="จำนวนไม้ที่เทรดแพ้ติดต่อกันยาวนานที่สุด (Losing Streak) เป็นจุดทดสอบจิตวิทยาและจุดอ่อนสำคัญที่สุดของระบบ ที่ต้องเตรียมรับมือ"
                formula="นับจำนวนไม้แพ้ต่อเนื่องตามลำดับเวลา"
              />
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 whitespace-nowrap shrink-0">
                Losing Streak
              </span>
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-rose-600 truncate">
              {{ kpis.consecLosses }} ไม้
            </p>
            <p class="text-xs text-rose-700/80 mt-1 font-medium truncate" title="จำนวนครั้งที่เทรดแพ้ติดต่อกันมากที่สุด (จุดอ่อนความเสี่ยง)">
              จำนวนครั้งที่เทรดแพ้ติดต่อกันมากที่สุด (จุดอ่อนความเสี่ยง)
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg sm:text-xl shrink-0 group-hover:scale-105 transition-transform">
            <i class="ph-bold ph-warning-circle"></i>
          </div>
        </div>

        <!-- MAX DRAWDOWN -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-xs flex items-center justify-between gap-3 min-w-0 relative group hover:z-30 hover:border-rose-300 transition-all">
          <div class="relative z-10 min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5 mb-1">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap shrink-0">MAX DRAWDOWN</p>
              <InfoTooltip
                title="Max Drawdown (พอร์ตยุบตัวสูงสุด %)"
                description="เปอร์เซ็นต์ที่พอร์ตลดลงลึกที่สุดจากจุดสูงสุดของเงินทุน (Peak to Trough) ช่วยให้ทราบว่าต้องเผื่อเงินสำรองไว้เท่าไหร่เพื่อไม่ให้พอร์ตแตก"
                formula="((Peak Balance - Valley Balance) ÷ Peak Balance) × 100%"
              />
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 whitespace-nowrap shrink-0">
                Peak to Trough
              </span>
            </div>
            <p class="text-xl sm:text-2xl font-extrabold text-rose-600 truncate">
              -{{ kpis.maxDrawdown }}%
            </p>
            <p class="text-xs text-rose-700/80 mt-1 font-medium truncate" title="เปอร์เซ็นต์พอร์ตยุบตัวลึกที่สุดจากจุดสูงสุด">
              เปอร์เซ็นต์พอร์ตยุบตัวลึกที่สุดจากจุดสูงสุด
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg sm:text-xl shrink-0 group-hover:scale-105 transition-transform">
            <i class="ph-bold ph-trend-down"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row 1: Equity Curve & Trade Outcomes -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Main Equity Curve (with timeframe filters) -->
      <YearlySalesChart
        class="lg:col-span-2"
        title="Simulated Equity Curve"
        :subtitle="`Projected balance (${equityCurveTimeframeLabel})`"
        infoTitle="Simulated Equity Curve (กราฟการเติบโตของพอร์ต)"
        infoDescription="กราฟจำลองเส้นทางการเติบโตของเงินทุนตามลำดับเวลาและผลการเทรดจริง สามารถปรับดูตามรายไม้ รายชั่วโมง รายวัน รายเดือน หรือรายปีได้อิสระ"
        infoFormula="ยอดเงินสะสมต่อเนื่องในแต่ละช่วงเวลา"
        :labels="equityCurveData.labels"
        :datasets="equityCurveData.datasets"
        :timeframe="equityCurveTimeframe"
        :timeframeOptions="equityCurveTimeframeOptions"
        @update:timeframe="handleEquityCurveTimeframeChange"
      />

      <!-- Win/Loss Ratio Doughnut -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
        <div class="flex flex-col gap-2 mb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <h2 class="text-lg font-bold text-gray-900">Trade Outcomes</h2>
              <InfoTooltip
                title="Trade Outcomes (สัดส่วนผลลัพธ์การเทรด)"
                description="กราฟโดนัทแสดงสัดส่วนระหว่างไม้ชนะ (Wins), ไม้แพ้ (Losses), และไม้เสมอตัว (Break Even) ช่วยประเมินความสม่ำเสมอในการออกออเดอร์ของระบบ"
                formula="สัดส่วน Wins / Losses / BE จากจำนวนไม้ทั้งหมด"
              />
            </div>
            <span class="text-xs font-semibold text-gray-400">({{ statMode.toUpperCase() }} mode)</span>
          </div>

          <!-- Win / Loss / BE Badges -->
          <div class="flex flex-wrap items-center gap-1.5 pt-1">
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              {{ outcomeDistribution.data[0] }} Wins (ไม้)
            </span>
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <span class="w-2 h-2 rounded-full bg-rose-500"></span>
              {{ outcomeDistribution.data[1] }} Losses (ไม้)
            </span>
            <span v-if="outcomeDistribution.data[2] > 0" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              {{ outcomeDistribution.data[2] }} BE (ไม้)
            </span>
          </div>
        </div>

        <CurrentDownloadChart
          :total="outcomeDistribution.data.reduce((a, b) => a + b, 0)"
          :chartData="outcomeDistribution"
        />
      </div>
    </div>

    <!-- Charts Row 2: Net PnL (Full Width with Timeframe Filters) -->
    <div class="mb-8">
      <AreaInstalledChart
        :title="`Net PnL (${netPnlTimeframeLabel})`"
        :subtitle="`Simulated profit/loss (${netPnlTimeframeLabel})`"
        infoTitle="Net PnL (กำไร/ขาดทุนสุทธิ)"
        infoDescription="กราฟแท่งแสดงผลกำไรขาดทุนสุทธิรวมตามช่วงเวลาที่เลือก สามารถปรับดูแบบรายชั่วโมง รายวัน รายเดือน หรือรายปีได้อิสระ"
        infoFormula="ผลรวม PnL ของออเดอร์ในแต่ละช่วงเวลา"
        :labels="netPnlChartData.labels"
        :datasets="netPnlChartData.datasets"
        :timeframe="netPnlTimeframe"
        :timeframeOptions="netPnlTimeframeOptions"
        @update:timeframe="handleNetPnlTimeframeChange"
      />
    </div>

    <!-- Charts Row 3: Performance by Session (Multi-Dimensional Radars) -->
    <div class="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold border border-sky-100">
            <i class="ph-bold ph-radar text-xl"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold text-gray-900">
                Performance by session
              </h2>
              <InfoTooltip
                title="Performance by Session (ประสิทธิภาพตามช่วงเวลาตลาด)"
                description="วิเคราะห์ประสิทธิภาพการเทรดในแต่ละช่วงเวลาตลาด (Asia, London, New York) ครอบคลุม 4 มิติสำคัญ: Win Rate, Total Trades, Avg RR, และ Profit"
                formula="เปรียบเทียบสถิติแยกตาม Session"
              />
            </div>
            <p class="text-xs text-gray-500 font-medium">
              วิเคราะห์หลายมิติ (Win Rate, Total Trades, Avg RR, Profit) ตามโหมด {{ statMode.toUpperCase() }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <span class="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200/80 px-3 py-1.5 rounded-xl">
            <span class="w-2 h-2 rounded-full bg-sky-500"></span>
            Asia · London · New York
          </span>
        </div>
      </div>

      <!-- 4 Radar Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <!-- 1. Win Rate -->
        <SessionRadarCard
          title="Win Rate"
          :labels="sessionMultiMetrics.labels"
          :data="sessionMultiMetrics.winRateData"
          unit="%"
          accentColor="#0284c7"
          infoTitle="Win Rate by Session"
          infoDescription="อัตราการชนะ (Win Rate %) ของแต่ละช่วงเวลาตลาด ช่วยวิเคราะห์ว่าระบบเทรดได้เปรียบที่สุดในเซสชันใด"
          infoFormula="(ไม้ชนะใน Session ÷ ไม้ทั้งหมดใน Session) × 100%"
        />

        <!-- 2. Total Trades -->
        <SessionRadarCard
          title="Total Trades"
          :labels="sessionMultiMetrics.labels"
          :data="sessionMultiMetrics.totalTradesData"
          unit="trades"
          accentColor="#6366f1"
          infoTitle="Total Trades by Session"
          infoDescription="จำนวนครั้งที่เข้าเทรดทั้งหมดในแต่ละช่วงเวลาตลาด ช่วยดูว่าเราออกออเดอร์ในเซสชันไหนบ่อยที่สุด"
          infoFormula="นับจำนวนไม้ที่เปิดใน Session นั้นๆ"
        />

        <!-- 3. Avg RR -->
        <SessionRadarCard
          title="Avg RR"
          :labels="sessionMultiMetrics.labels"
          :data="sessionMultiMetrics.avgRrData"
          unit="R"
          accentColor="#0d9488"
          infoTitle="Average RR by Session"
          infoDescription="ผลตอบแทนต่อความเสี่ยงเฉลี่ย (Average RR) ต่อไม้ในแต่ละช่วงเวลาตลาด บอกว่าเซสชันไหนให้กำไรเฉลี่ยต่อความเสี่ยงคุ้มค่าที่สุด"
          infoFormula="ผลรวม RR ใน Session ÷ จำนวนไม้ใน Session"
        />

        <!-- 4. Profit -->
        <SessionRadarCard
          title="Profit"
          :labels="sessionMultiMetrics.labels"
          :data="sessionMultiMetrics.profitData"
          unit="$"
          accentColor="#10b981"
          infoTitle="Net Profit by Session"
          infoDescription="กำไรสุทธิ ($) รวมในแต่ละช่วงเวลาตลาด แสดงว่าเงินกำไรของพอร์ตมาจากเซสชันไหนเป็นหลัก"
          infoFormula="ผลรวม PnL ($) ของทุกออเดอร์ใน Session นั้น"
        />
      </div>
    </div>

    <!-- Trades Table -->
    <div class="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
      <!-- Table Header & Batch Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-lg font-bold text-gray-900">Recent Trades</h2>
          <p class="text-sm text-gray-500">List of trades matching current filters</p>
        </div>

        <!-- Multiple Delete Batch Actions -->
        <Transition name="fade">
          <div
            v-if="selectedTradeIds.length > 0"
            class="flex items-center gap-3 bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-100"
          >
            <span class="text-sm font-bold flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {{ selectedTradeIds.length }} {{ selectedTradeIds.length === 1 ? 'trade' : 'trades' }} selected
            </span>
            <button
              @click="openDeleteBatchModal"
              class="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
              Delete Selected
            </button>
            <button
              @click="selectedTradeIds = []"
              class="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </Transition>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[960px]">
          <thead>
            <tr class="bg-gray-50 border-y border-gray-200 text-gray-500 text-sm font-semibold">
              <!-- Select All Checkbox -->
              <th class="py-4 px-4 w-12 text-center">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  :indeterminate.prop="isPartiallySelected"
                  @change="toggleSelectAll"
                  :disabled="filteredTrades.length === 0"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer align-middle"
                  title="Select all trades"
                />
              </th>
              <th class="py-4 px-4">Date</th>
              <th class="py-4 px-4">
                <div class="flex items-center gap-1.5">
                  <span>Duration</span>
                  <InfoTooltip
                    title="Holding Duration (ระยะเวลาถือออเดอร์)"
                    description="ระยะเวลาตั้งแต่เปิดออเดอร์ (Entry Time) จนถึงปิดออเดอร์ (Exit Time) ใช้ประเมินความเร็วในการทำกำไรและสไตล์การถือครอง (Scalping / Day Trade / Swing)"
                    formula="Exit Time - Entry Time"
                  />
                </div>
              </th>
              <th class="py-4 px-4">Setup</th>
              <th class="py-4 px-4">Symbol</th>
              <th class="py-4 px-4">Position</th>
              <th class="py-4 px-4">Session</th>
              <th class="py-4 px-4 text-right">RR ({{ statMode.toUpperCase() }})</th>
              <th class="py-4 px-4 text-center">Quality</th>
              <th class="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="text-sm font-medium">
            <tr
              v-for="trade in displayTrades"
              :key="trade.id"
              :class="[
                selectedTradeIds.includes(trade.id) ? 'bg-blue-50/50' : 'hover:bg-gray-50',
                'border-b border-gray-100 transition-colors'
              ]"
            >
              <!-- Row Checkbox -->
              <td class="py-4 px-4 text-center">
                <input
                  type="checkbox"
                  :value="trade.id"
                  v-model="selectedTradeIds"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer align-middle"
                />
              </td>
              <td class="py-4 px-4 text-gray-900 whitespace-nowrap">
                {{ new Date(trade.entryDatetime).toLocaleDateString() }}
                <div class="text-xs text-gray-500">
                  {{ new Date(trade.entryDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                </div>
              </td>
              <!-- Duration (Exit - Entry) -->
              <td
                class="py-4 px-4 text-gray-900 whitespace-nowrap"
                :title="calculateTradeDuration(trade.entryDatetime, trade.exitDatetime).title"
              >
                <div class="flex items-center gap-1.5">
                  <i class="ph-bold ph-timer text-gray-400 text-sm"></i>
                  <span class="font-semibold text-gray-800">
                    {{ calculateTradeDuration(trade.entryDatetime, trade.exitDatetime).text }}
                  </span>
                </div>
                <div
                  v-if="calculateTradeDuration(trade.entryDatetime, trade.exitDatetime).subText"
                  class="text-xs text-gray-400 mt-0.5"
                >
                  {{ calculateTradeDuration(trade.entryDatetime, trade.exitDatetime).subText }}
                </div>
              </td>
              <td class="py-4 px-4 text-gray-900">
                <div class="flex items-center gap-1.5">
                  <span>{{ trade.setupName || 'Unknown' }}</span>
                  <span
                    v-if="trade.isTest"
                    class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700"
                    title="Paper / Test Trade"
                  >
                    Paper
                  </span>
                </div>
              </td>
              <td class="py-4 px-4 text-gray-900">{{ trade.symbolName || 'Unknown' }}</td>
              <td class="py-4 px-4">
                <span
                  :class="[
                    'px-2 py-1 rounded text-xs font-bold',
                    trade.position === 'Buy' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                  ]"
                >
                  {{ trade.position }}
                </span>
              </td>
              <td class="py-4 px-4 text-gray-900">{{ trade.sessionName || '-' }}</td>
              <td class="py-4 px-4 text-right">
                <span
                  :class="[
                    'font-bold',
                    getTradeRr(trade) > 0 ? 'text-green-600' : 
                    getTradeRr(trade) < 0 ? 'text-red-600' : 'text-gray-500'
                  ]"
                >
                  {{ getTradeRr(trade) }}R
                </span>
              </td>
              <td class="py-4 px-4 text-center">
                <div
                  :class="[
                    'w-3 h-3 rounded-full mx-auto',
                    {
                      'bg-green-500': trade.quality === 'Green',
                      'bg-blue-500': trade.quality === 'Blue',
                      'bg-yellow-400': trade.quality === 'Yellow',
                      'bg-orange-500': trade.quality === 'Orange',
                      'bg-red-500': trade.quality === 'Red'
                    }
                  ]"
                  :title="trade.quality"
                ></div>
              </td>
              <td class="py-4 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="openTradeDetails(trade.id)"
                    class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="View Details"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </button>
                  <button
                    @click="openTradeScreenshots(trade.id)"
                    class="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="View Screenshots"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </button>
                  <button
                    @click="openDeleteSingleModal(trade.id)"
                    class="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                    title="Delete Trade"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredTrades.length === 0">
              <td colspan="10" class="py-8 text-center text-gray-500">
                No trades found matching the current filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Calendar View Section -->
    <div class="mt-8">
      <CalendarView
        :embedded-trades="allTrades"
        :initial-stat-mode="statMode"
        :initial-capital="simulation.initialBalance"
        :initial-risk-percent="simulation.riskPerTrade"
        :initial-return-calculation="simulation.returnCalculation"
        :initial-trade-type="filters.tradeType"
        :initial-setup="filters.setup"
      />
    </div>
    
    <!-- Trade Details Modal -->
    <TradeDetailsModal
      v-model:show="showTradeDetails"
      :tradeId="selectedTradeId"
      class="export-exclude"
    />
    
    <!-- Trade Screenshots Modal -->
    <TradeScreenshotsModal
      v-model:show="showTradeScreenshots"
      :tradeId="selectedTradeId"
      class="export-exclude"
    />

    <!-- Delete Confirmation Modal -->
    <BaseConfirmModal
      :isOpen="showDeleteModal"
      :title="deleteModalTitle"
      :message="deleteModalMessage"
      confirmText="Yes, Delete"
      cancelText="Cancel"
      variant="danger"
      class="export-exclude"
      @confirm="handleConfirmDelete"
      @cancel="showDeleteModal = false"
    />

    <!-- Toast Notification -->
    <BaseAlertDialog
      :isOpen="toast.isOpen"
      :title="toast.title"
      :message="toast.message"
      :variant="toast.variant"
      class="export-exclude"
      @close="toast.isOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { toPng } from 'html-to-image'
import PastelStatCard from '../ui/PastelStatCard.vue'
import YearlySalesChart from '../ui/YearlySalesChart.vue'
import CurrentDownloadChart from '../ui/CurrentDownloadChart.vue'
import AreaInstalledChart from '../ui/AreaInstalledChart.vue'
import SessionRadarCard from '../ui/SessionRadarCard.vue'
import BaseSelect from '../ui/BaseSelect.vue'
import TradeDetailsModal from '../ui/TradeDetailsModal.vue'
import TradeScreenshotsModal from '../ui/TradeScreenshotsModal.vue'
import BaseConfirmModal from '../ui/BaseConfirmModal.vue'
import BaseAlertDialog from '../ui/BaseAlertDialog.vue'
import InfoTooltip from '../ui/InfoTooltip.vue'
import CalendarView from '../ui/CalendarView.vue'
import { calculateTradeDuration } from '../../utils/duration'

// Dashboard DOM ref & Export state
const dashboardRef = ref<HTMLElement | null>(null)
const isCapturing = ref(false)

// Stat Mode: 'normal' | 'be' | 'trail'
const statMode = ref<'normal' | 'be' | 'trail'>('normal')

// Timeframe Filters for Equity Curve and Net PnL
const equityCurveTimeframe = ref<'trade' | 'hourly' | 'daily' | 'monthly' | 'yearly'>('trade')
const equityCurveTimeframeOptions = [
  { label: 'Per Trade (รายไม้)', value: 'trade' },
  { label: 'Hourly (รายชั่วโมง)', value: 'hourly' },
  { label: 'Daily (รายวัน)', value: 'daily' },
  { label: 'Monthly (รายเดือน)', value: 'monthly' },
  { label: 'Yearly (รายปี)', value: 'yearly' }
]
const equityCurveTimeframeLabel = computed(() => {
  switch (equityCurveTimeframe.value) {
    case 'trade':
      return 'Per Trade / รายไม้'
    case 'hourly':
      return 'Hourly / รายชั่วโมง'
    case 'daily':
      return 'Daily / รายวัน'
    case 'monthly':
      return 'Monthly / รายเดือน'
    case 'yearly':
      return 'Yearly / รายปี'
    default:
      return 'All Time'
  }
})

const netPnlTimeframe = ref<'hourly' | 'daily' | 'monthly' | 'yearly'>('daily')
const netPnlTimeframeOptions = [
  { label: 'Hourly (รายชั่วโมง)', value: 'hourly' },
  { label: 'Daily (รายวัน)', value: 'daily' },
  { label: 'Monthly (รายเดือน)', value: 'monthly' },
  { label: 'Yearly (รายปี)', value: 'yearly' }
]
const netPnlTimeframeLabel = computed(() => {
  switch (netPnlTimeframe.value) {
    case 'hourly':
      return 'Hourly / รายชั่วโมง'
    case 'daily':
      return 'Daily / รายวัน'
    case 'monthly':
      return 'Monthly / รายเดือน'
    case 'yearly':
      return 'Yearly / รายปี'
    default:
      return 'Daily / รายวัน'
  }
})

const handleEquityCurveTimeframeChange = (val: string) => {
  equityCurveTimeframe.value = val as 'trade' | 'hourly' | 'daily' | 'monthly' | 'yearly'
}

const handleNetPnlTimeframeChange = (val: string) => {
  netPnlTimeframe.value = val as 'hourly' | 'daily' | 'monthly' | 'yearly'
}

// Trade Details Modal State
const showTradeDetails = ref(false)
const showTradeScreenshots = ref(false)
const selectedTradeId = ref<number | null>(null)

// Multiple Selection State
const selectedTradeIds = ref<number[]>([])

const isAllSelected = computed(() => {
  if (filteredTrades.value.length === 0) return false
  return filteredTrades.value.every((t) => selectedTradeIds.value.includes(t.id))
})

const isPartiallySelected = computed(() => {
  if (filteredTrades.value.length === 0) return false
  const someSelected = filteredTrades.value.some((t) => selectedTradeIds.value.includes(t.id))
  return someSelected && !isAllSelected.value
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    const visibleIds = new Set(filteredTrades.value.map((t) => t.id))
    selectedTradeIds.value = selectedTradeIds.value.filter((id) => !visibleIds.has(id))
  } else {
    const currentSet = new Set(selectedTradeIds.value)
    filteredTrades.value.forEach((t) => currentSet.add(t.id))
    selectedTradeIds.value = Array.from(currentSet)
  }
}

// Deletion State & Modals
const showDeleteModal = ref(false)
const tradesToDelete = ref<number[]>([])
const isDeleting = ref(false)

const deleteModalTitle = computed(() => {
  if (tradesToDelete.value.length > 1) {
    return `Delete ${tradesToDelete.value.length} Trades?`
  }
  return 'Delete Trade Entry?'
})

const deleteModalMessage = computed(() => {
  if (tradesToDelete.value.length > 1) {
    return `Are you sure you want to delete ${tradesToDelete.value.length} selected trades? This action cannot be undone.`
  }
  return 'Are you sure you want to delete this trade journal entry? This action cannot be undone.'
})

const openDeleteSingleModal = (id: number) => {
  tradesToDelete.value = [id]
  showDeleteModal.value = true
}

const openDeleteBatchModal = () => {
  if (selectedTradeIds.value.length === 0) return
  tradesToDelete.value = [...selectedTradeIds.value]
  showDeleteModal.value = true
}

// Toast Notifications State
const toast = ref({
  isOpen: false,
  title: '',
  message: '',
  variant: 'info' as 'success' | 'error' | 'info'
})

const showToast = (title: string, message: string, variant: 'success' | 'error' | 'info' = 'info') => {
  toast.value = {
    isOpen: true,
    title,
    message,
    variant
  }
}

// Capture Dashboard Full-Page Screenshot
const captureDashboard = async () => {
  if (!dashboardRef.value || isCapturing.value) return
  isCapturing.value = true

  try {
    const element = dashboardRef.value
    // Wait for all fonts (including icon fonts) to be ready
    if (document.fonts) {
      await document.fonts.ready
    }
    // Short delay to let any UI animations settle
    await new Promise((resolve) => setTimeout(resolve, 200))

    const width = element.scrollWidth
    const height = element.scrollHeight

    const captureOptions = {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#f9fafb',
      width,
      height,
      filter: (node: HTMLElement) => {
        if (node.classList && node.classList.contains('export-exclude')) {
          return false
        }
        return true
      }
    }

    let dataUrl: string
    try {
      dataUrl = await toPng(element, captureOptions)
    } catch (err) {
      console.warn('Initial capture with font embed failed, retrying with skipFonts: true', err)
      dataUrl = await toPng(element, { ...captureOptions, skipFonts: true })
    }

    const dateStr = new Date().toISOString().split('T')[0]
    const defaultFileName = `Trading_Dashboard_${statMode.value.toUpperCase()}_${dateStr}.png`

    if (window.api?.images?.export) {
      const res = await window.api.images.export(dataUrl, defaultFileName)
      if (res.canceled) {
        return
      }

      if (res.success) {
        if (window.api?.images?.copyToClipboard) {
          try {
            await window.api.images.copyToClipboard(dataUrl)
          } catch (clipErr) {
            console.warn('Clipboard copy failed:', clipErr)
          }
        }

        const fileName = res.filePath ? res.filePath.split(/[\\/]/).pop() : defaultFileName
        showToast(
          'Export Successful',
          `Dashboard saved as "${fileName}"\n(Also copied to clipboard)`,
          'success'
        )
      } else {
        showToast('Export Failed', res.error || 'Failed to save dashboard image.', 'error')
      }
    } else {
      // Browser fallback (download link)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = defaultFileName
      a.click()
      showToast('Export Successful', `Dashboard downloaded as "${defaultFileName}"`, 'success')
    }
  } catch (err: any) {
    console.error('Failed to capture dashboard:', err)
    showToast('Export Failed', err.message || 'An error occurred while capturing image.', 'error')
  } finally {
    isCapturing.value = false
  }
}

const handleConfirmDelete = async () => {
  if (tradesToDelete.value.length === 0 || isDeleting.value) return
  isDeleting.value = true
  try {
    let result: any
    if (tradesToDelete.value.length === 1) {
      result = await window.api.journal.delete(tradesToDelete.value[0])
    } else {
      result = await window.api.journal.deleteMany(tradesToDelete.value)
    }

    if (result.success) {
      const count = tradesToDelete.value.length
      const deletedSet = new Set(tradesToDelete.value)
      selectedTradeIds.value = selectedTradeIds.value.filter((id) => !deletedSet.has(id))
      showDeleteModal.value = false
      tradesToDelete.value = []

      showToast(
        'Deleted Successfully',
        count === 1 ? 'Trade entry was deleted.' : `${count} trades were deleted.`,
        'success'
      )
      await fetchData()
    } else {
      showToast('Delete Failed', result.error || 'Failed to delete trade.', 'error')
    }
  } catch (err: any) {
    showToast('Delete Failed', err.message || 'Error occurred.', 'error')
  } finally {
    isDeleting.value = false
  }
}

const openTradeDetails = (id: number) => {
  selectedTradeId.value = id
  showTradeDetails.value = true
}

const openTradeScreenshots = (id: number) => {
  selectedTradeId.value = id
  showTradeScreenshots.value = true
}

// Filters State
const filters = ref({
  setup: 'all',
  symbol: 'all',
  session: 'all',
  tradeType: 'all', // 'all' | 'real' | 'test'
  startDate: '',
  endDate: '',
  customFields: {} as Record<string, string>
})
const allReportCustomColumns = ref<any[]>([])
const reportCustomColumns = computed(() => {
  if (filters.value.setup === 'all') return []
  return allReportCustomColumns.value.filter((c) => c.setupId.toString() === String(filters.value.setup))
})

const simulation = ref({
  initialBalance: 10000,
  riskPerTrade: 1,
  returnCalculation: 'simple' as 'simple' | 'log'
})

const resetFilters = () => {
  filters.value = {
    setup: 'all',
    symbol: 'all',
    session: 'all',
    tradeType: 'all',
    startDate: '',
    endDate: '',
    customFields: {}
  }
}

const allTrades = ref<any[]>([])
const setups = ref<{ id: number; name: string }[]>([])
const symbols = ref<{ id: number; name: string }[]>([])

// Available Sessions (derived from trades + defaults)
const availableSessions = computed(() => {
  const sessionSet = new Set<string>()
  allTrades.value.forEach((t) => {
    if (t.sessionName && t.sessionName.trim()) {
      sessionSet.add(t.sessionName.trim())
    }
  })
  if (sessionSet.size === 0) {
    ;['London', 'New York', 'Asia'].forEach((s) => sessionSet.add(s))
  }
  return [
    { label: 'All Sessions', value: 'all' },
    ...Array.from(sessionSet).map((s) => ({ label: s, value: s }))
  ]
})

// Helper to get RR for a trade according to selected RR mode
const getTradeRr = (trade: any, mode: 'normal' | 'be' | 'trail' = statMode.value): number => {
  if (mode === 'normal') return Number(trade.normalRr ?? 0)
  if (mode === 'be') return Number(trade.beRr ?? trade.normalRr ?? 0)
  if (mode === 'trail') return Number(trade.trailRr ?? trade.normalRr ?? 0)
  return 0
}

// Helper to get Max RR for a trade according to selected RR mode
const getTradeMaxRr = (trade: any, mode: 'normal' | 'be' | 'trail' = statMode.value): number => {
  if (mode === 'normal') return Number(trade.normalMaxRr ?? trade.normalRr ?? 0)
  if (mode === 'be') return Number(trade.beMaxRr ?? trade.normalMaxRr ?? trade.beRr ?? trade.normalRr ?? 0)
  if (mode === 'trail') return Number(trade.trailMaxRr ?? trade.normalMaxRr ?? trade.trailRr ?? trade.normalRr ?? 0)
  return 0
}

// Single Source of Truth: Filter trades based on selected filters
const filteredTrades = computed(() => {
  return allTrades.value.filter((t) => {
    if (
      filters.value.setup !== 'all' &&
      t.setupId?.toString() !== String(filters.value.setup)
    )
      return false

    if (
      filters.value.symbol !== 'all' &&
      t.symbolId?.toString() !== String(filters.value.symbol)
    )
      return false

    if (
      filters.value.session !== 'all' &&
      (!t.sessionName || t.sessionName.toLowerCase() !== filters.value.session.toLowerCase())
    )
      return false

    // Trade Type filter (Real vs Paper/Test)
    if (filters.value.tradeType === 'real' && t.isTest) return false
    if (filters.value.tradeType === 'test' && !t.isTest) return false

    if (filters.value.startDate) {
      const [y, m, d] = filters.value.startDate.split('-').map(Number)
      const sDate = new Date(y, m - 1, d, 0, 0, 0, 0)
      if (new Date(t.entryDatetime) < sDate) return false
    }

    if (filters.value.endDate) {
      const [y, m, d] = filters.value.endDate.split('-').map(Number)
      const eDate = new Date(y, m - 1, d, 23, 59, 59, 999)
      if (new Date(t.entryDatetime) > eDate) return false
    }

    // Custom Fields filtering
    for (const col of reportCustomColumns.value) {
      const filterVal = filters.value.customFields[col.id]
      if (filterVal !== undefined && filterVal !== '' && filterVal !== 'all') {
        const tradeCustomData = t.customData ? (typeof t.customData === 'string' ? JSON.parse(t.customData) : t.customData) : {}
        
        const actualVal = tradeCustomData[col.id]
        if (col.type === 'switch' || col.type === 'checkbox') {
          const boolActual = String(actualVal) === 'true'
          const boolFilter = String(filterVal) === 'true'
          if (boolActual !== boolFilter) return false
        } else if (col.type === 'multiple_selector') {
          if (Array.isArray(actualVal)) {
            if (!actualVal.includes(filterVal)) return false
          } else if (!actualVal || !String(actualVal).includes(String(filterVal))) {
            return false
          }
        } else if (col.type === 'string') {
          if (!actualVal || !String(actualVal).toLowerCase().includes(String(filterVal).toLowerCase())) return false
        } else if (col.type === 'number') {
          if (actualVal === undefined || actualVal === null || Number(actualVal) !== Number(filterVal)) return false
        } else {
          if (String(actualVal) !== String(filterVal)) return false
        }
      }
    }

    return true
  })
})

// Display trades in Recent Trades table with newest entries on top
const displayTrades = computed(() => [...filteredTrades.value].reverse())

// Reset selected trades when filters change
watch(
  filters,
  () => {
    selectedTradeIds.value = []
  },
  { deep: true }
)

// Reactive KPIs computed directly from filteredTrades (Exact Same Dataset)
const kpis = computed(() => {
  const trades = filteredTrades.value
  const total = trades.length
  const initialBalance = Number(simulation.value.initialBalance) || 10000

  if (total === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      avgRr: 0,
      maxDrawdown: 0,
      wins: 0,
      losses: 0,
      breakEvens: 0,
      grossProfit: 0,
      grossLoss: 0,
      netPnl: 0,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0,
      finalBalance: initialBalance,
      totalRr: 0,
      avgWinLossRr: 0,
      avgWinRr: 0,
      maxRr: 0,
      avgMaxRr: 0,
      consecWins: 0,
      consecLosses: 0
    }
  }

  const isSimple = simulation.value.returnCalculation === 'simple'
  const riskPercent = (Number(simulation.value.riskPerTrade) || 1) / 100
  const fixedRiskAmount = initialBalance * riskPercent

  let wins = 0
  let losses = 0
  let breakEvens = 0
  let grossProfit = 0
  let grossLoss = 0
  let totalRr = 0
  let winningRr = 0
  let currentBalance = initialBalance
  let peak = currentBalance
  let maxDrawdown = 0

  let consecWins = 0
  let currentWins = 0
  let consecLosses = 0
  let currentLosses = 0

  let maxSingleRr = 0
  let sumMaxRr = 0
  let countMaxRr = 0

  for (const trade of trades) {
    const rr = getTradeRr(trade, statMode.value)
    const tMaxRr = getTradeMaxRr(trade, statMode.value)
    const effectivePeakRr = Math.max(rr, tMaxRr)

    totalRr += rr

    const riskAmount = isSimple ? fixedRiskAmount : currentBalance * riskPercent
    const pnl = riskAmount * rr
    currentBalance += pnl

    if (effectivePeakRr > maxSingleRr) {
      maxSingleRr = effectivePeakRr
    }

    if (tMaxRr > 0) {
      sumMaxRr += tMaxRr
      countMaxRr++
    } else if (rr > 0) {
      sumMaxRr += rr
      countMaxRr++
    }

    if (rr > 0) {
      wins++
      winningRr += rr
      grossProfit += pnl
      currentWins++
      currentLosses = 0
      if (currentWins > consecWins) consecWins = currentWins
    } else if (rr < 0) {
      losses++
      grossLoss += Math.abs(pnl)
      currentLosses++
      currentWins = 0
      if (currentLosses > consecLosses) consecLosses = currentLosses
    } else {
      breakEvens++
      currentWins = 0
      currentLosses = 0
    }

    if (currentBalance > peak) peak = currentBalance
    const dd = peak > 0 ? ((peak - currentBalance) / peak) * 100 : 0
    if (dd > maxDrawdown) maxDrawdown = dd
  }

  const netPnl = grossProfit - grossLoss

  // PROFIT FACTOR: GROSS PROFIT / GROSS LOSS
  let profitFactor = 0
  if (grossLoss > 0) {
    profitFactor = Number((grossProfit / grossLoss).toFixed(2))
  } else if (grossProfit > 0) {
    profitFactor = 999.00
  }

  // AVG WIN $: GROSS PROFIT / WINS
  const avgWin = wins > 0 ? Number((grossProfit / wins).toFixed(2)) : 0

  // AVG LOSS $: GROSS LOSS / LOSSES
  const avgLoss = losses > 0 ? Number((grossLoss / losses).toFixed(2)) : 0

  // FINAL BALANCE: ทุนเริ่มต้น + NET PNL
  const finalBalance = Number((initialBalance + netPnl).toFixed(2))

  // AVG RR (Win/Loss Payoff Ratio): AVG WIN $ / AVG LOSS $
  const avgWinLossRr = avgLoss > 0 ? Number((avgWin / avgLoss).toFixed(2)) : (wins > 0 ? Number((winningRr / wins).toFixed(2)) : 0)
  const avgWinRr = wins > 0 ? Number((winningRr / wins).toFixed(2)) : 0
  const avgMaxRr = countMaxRr > 0 ? Number((sumMaxRr / countMaxRr).toFixed(2)) : 0

  return {
    totalTrades: total,
    winRate: Number(((wins / total) * 100).toFixed(1)),
    avgRr: Number((totalRr / total).toFixed(2)),
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    wins,
    losses,
    breakEvens,
    grossProfit: Number(grossProfit.toFixed(2)),
    grossLoss: Number(grossLoss.toFixed(2)),
    netPnl: Number(netPnl.toFixed(2)),
    profitFactor,
    avgWin,
    avgLoss,
    finalBalance,
    totalRr: Number(totalRr.toFixed(2)),
    avgWinLossRr,
    avgWinRr,
    maxRr: Number(maxSingleRr.toFixed(2)),
    avgMaxRr,
    consecWins,
    consecLosses
  }
})

// Fetch all Trades, Setups, Symbols
const fetchData = async () => {
  try {
    const listRes = await window.api.journal.list()
    if (listRes.success) {
      allTrades.value = listRes.data.sort(
        (a: any, b: any) =>
          new Date(a.entryDatetime).getTime() - new Date(b.entryDatetime).getTime()
      )
    }

    const setupsRes = await window.api.setups.list()
    if (setupsRes.success) setups.value = setupsRes.data

    const symbolsRes = await window.api.symbols.list()
    if (symbolsRes.success) symbols.value = symbolsRes.data

    // Fetch report_filter custom columns
    const cols: any[] = []
    for (const setup of setups.value) {
      const details = await window.api.setups.getDetails(setup.id)
      if (details.success && details.data.customColumns) {
        cols.push(...details.data.customColumns.filter((c: any) => c.reportFilter))
      }
    }
    allReportCustomColumns.value = cols
  } catch (err) {
    console.error('Failed to fetch data:', err)
  }
}

// Compute Equity Curve Data (Directly from filteredTrades - Exact Same Dataset)
const equityCurveData = computed(() => {
  const trades = filteredTrades.value
  const isSimple = simulation.value.returnCalculation === 'simple'
  const initialBalance = Number(simulation.value.initialBalance) || 10000
  const riskPercent = (Number(simulation.value.riskPerTrade) || 1) / 100
  const fixedRiskAmount = initialBalance * riskPercent

  let currentBalance = initialBalance

  if (equityCurveTimeframe.value === 'trade') {
    const labels: string[] = ['Start']
    const data: number[] = [Number(initialBalance.toFixed(2))]

    trades.forEach((trade, index) => {
      const rr = getTradeRr(trade, statMode.value)
      const riskAmount = isSimple ? fixedRiskAmount : currentBalance * riskPercent
      const pnl = riskAmount * rr
      currentBalance += pnl

      const dateStr = new Date(trade.entryDatetime).toLocaleDateString([], {
        month: 'numeric',
        day: 'numeric'
      })
      labels.push(`#${index + 1} (${dateStr})`)
      data.push(Number(currentBalance.toFixed(2)))
    })

    return {
      labels: labels.length > 0 ? labels : ['No Data'],
      datasets: [
        {
          label: `Balance ($) [${statMode.value.toUpperCase()} - ${isSimple ? 'SIMPLE' : 'LOG'}]`,
          data: data.length > 0 ? data : [initialBalance],
          borderColor: '#00a76f',
          backgroundColor: 'rgba(0, 167, 111, 0.1)',
          total:
            '$' +
            currentBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
        }
      ]
    }
  }

  // Aggregated Timeframe: hourly | daily | monthly | yearly
  const tradePoints: { key: string; label: string; balance: number }[] = []

  trades.forEach((trade) => {
    const rr = getTradeRr(trade, statMode.value)
    const riskAmount = isSimple ? fixedRiskAmount : currentBalance * riskPercent
    const pnl = riskAmount * rr
    currentBalance += pnl

    const d = new Date(trade.entryDatetime)
    let key = ''
    let label = ''

    if (equityCurveTimeframe.value === 'hourly') {
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const hh = String(d.getHours()).padStart(2, '0') + ':00'
      key = `${yyyy}-${mm}-${dd} ${hh}`
      label = `${dd}/${mm} ${hh}`
    } else if (equityCurveTimeframe.value === 'daily') {
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      key = `${yyyy}-${mm}-${dd}`
      label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } else if (equityCurveTimeframe.value === 'monthly') {
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      key = `${yyyy}-${mm}`
      label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    } else if (equityCurveTimeframe.value === 'yearly') {
      key = String(d.getFullYear())
      label = String(d.getFullYear())
    }

    tradePoints.push({
      key,
      label,
      balance: currentBalance
    })
  })

  // Group by key, taking the LAST balance for each period
  const bucketMap: Record<string, { label: string; balance: number }> = {}
  tradePoints.forEach((pt) => {
    bucketMap[pt.key] = { label: pt.label, balance: pt.balance }
  })

  const sortedKeys = Object.keys(bucketMap).sort()
  const labels: string[] = ['Start', ...sortedKeys.map((k) => bucketMap[k].label)]
  const data: number[] = [
    Number(initialBalance.toFixed(2)),
    ...sortedKeys.map((k) => Number(bucketMap[k].balance.toFixed(2)))
  ]

  return {
    labels: labels.length > 0 ? labels : ['No Data'],
    datasets: [
      {
        label: `Balance ($) [${statMode.value.toUpperCase()} - ${isSimple ? 'SIMPLE' : 'LOG'}]`,
        data: data.length > 0 ? data : [initialBalance],
        borderColor: '#00a76f',
        backgroundColor: 'rgba(0, 167, 111, 0.1)',
        total:
          '$' +
          currentBalance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
      }
    ]
  }
})

// Compute Net PnL (Directly from filteredTrades - Exact Same Dataset)
const netPnlChartData = computed(() => {
  const trades = filteredTrades.value
  const buckets: Record<string, { label: string; pnl: number; count: number }> = {}

  const isSimple = simulation.value.returnCalculation === 'simple'
  const initialBalance = Number(simulation.value.initialBalance) || 10000
  const riskPercent = (Number(simulation.value.riskPerTrade) || 1) / 100
  const fixedRiskAmount = initialBalance * riskPercent

  let runningBalance = initialBalance

  trades.forEach((trade) => {
    const rr = getTradeRr(trade, statMode.value)
    const riskAmount = isSimple ? fixedRiskAmount : runningBalance * riskPercent
    const pnl = riskAmount * rr
    runningBalance += pnl

    const d = new Date(trade.entryDatetime)
    let key = ''
    let label = ''

    if (netPnlTimeframe.value === 'hourly') {
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const hh = String(d.getHours()).padStart(2, '0') + ':00'
      key = `${yyyy}-${mm}-${dd} ${hh}`
      label = `${dd}/${mm} ${hh}`
    } else if (netPnlTimeframe.value === 'daily') {
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      key = `${yyyy}-${mm}-${dd}`
      label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } else if (netPnlTimeframe.value === 'monthly') {
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      key = `${yyyy}-${mm}`
      label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    } else if (netPnlTimeframe.value === 'yearly') {
      key = String(d.getFullYear())
      label = String(d.getFullYear())
    }

    if (!buckets[key]) {
      buckets[key] = { label, pnl: 0, count: 0 }
    }
    buckets[key].pnl += pnl
    buckets[key].count++
  })

  const sortedKeys = Object.keys(buckets).sort()
  const labels = sortedKeys.map((k) => buckets[k].label)
  const data = sortedKeys.map((k) => Number(buckets[k].pnl.toFixed(2)))
  const totalNet = data.reduce((a, b) => a + b, 0)
  const bgColors = data.map((v) => (v >= 0 ? '#00a76f' : '#ff5630'))

  return {
    labels: labels.length > 0 ? labels : ['No Data'],
    datasets: [
      {
        label: `Net PnL [${statMode.value.toUpperCase()}]`,
        data: data.length > 0 ? data : [0],
        backgroundColor: bgColors,
        color: '#ffab00',
        total:
          (totalNet >= 0 ? '+$' : '-$') +
          Math.abs(totalNet).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
      }
    ]
  }
})

// Compute Win/Loss Distribution (Directly from filteredTrades - Exact Same Dataset)
const outcomeDistribution = computed(() => {
  const trades = filteredTrades.value
  let wins = 0
  let losses = 0
  let breakEvens = 0

  trades.forEach((trade) => {
    const rr = getTradeRr(trade, statMode.value)
    if (rr > 0) wins++
    else if (rr < 0) losses++
    else breakEvens++
  })

  return {
    labels: [`Wins (${wins} ไม้)`, `Losses (${losses} ไม้)`, `Break Evens (${breakEvens} ไม้)`],
    data: [wins, losses, breakEvens],
    colors: ['#00a76f', '#ff5630', '#ffab00']
  }
})

// Helper to normalize session names
const normalizeSessionName = (raw: string | null | undefined): string => {
  if (!raw) return 'Unknown'
  const trimmed = raw.trim()
  const lower = trimmed.toLowerCase()
  if (lower === 'asia' || lower === 'asian' || lower === 'tokyo') return 'Asia'
  if (lower === 'london' || lower === 'london close') return 'London'
  if (lower === 'new york' || lower === 'newyork' || lower === 'ny') return 'New York'
  return trimmed
}

// Multi-Dimensional Session Performance (Win Rate, Total Trades, Avg RR, Profit)
const sessionMultiMetrics = computed(() => {
  const trades = filteredTrades.value
  // Order to match reference screenshot: Asia (top), New York (right), London (left)
  const baseOrder = ['Asia', 'New York', 'London']
  const stats: Record<
    string,
    {
      wins: number
      losses: number
      be: number
      total: number
      sumRr: number
      netPnl: number
    }
  > = {}

  baseOrder.forEach((s) => {
    stats[s] = { wins: 0, losses: 0, be: 0, total: 0, sumRr: 0, netPnl: 0 }
  })

  const isSimple = simulation.value.returnCalculation === 'simple'
  const initialBalance = Number(simulation.value.initialBalance) || 10000
  const riskPercent = (Number(simulation.value.riskPerTrade) || 1) / 100
  const fixedRiskAmount = initialBalance * riskPercent

  let runningBalance = initialBalance

  trades.forEach((trade) => {
    const rr = getTradeRr(trade, statMode.value)
    const riskAmount = isSimple ? fixedRiskAmount : runningBalance * riskPercent
    const pnl = riskAmount * rr
    runningBalance += pnl

    const s = normalizeSessionName(trade.sessionName)
    if (!stats[s]) {
      stats[s] = { wins: 0, losses: 0, be: 0, total: 0, sumRr: 0, netPnl: 0 }
    }

    stats[s].total++
    stats[s].sumRr += rr
    stats[s].netPnl += pnl
    if (rr > 0) stats[s].wins++
    else if (rr < 0) stats[s].losses++
    else stats[s].be++
  })

  const extraSessions = Object.keys(stats).filter((s) => !baseOrder.includes(s) && s !== 'Unknown')
  const labels = [...baseOrder, ...extraSessions]

  const winRateData = labels.map((s) =>
    stats[s].total > 0 ? Number(((stats[s].wins / stats[s].total) * 100).toFixed(1)) : 0
  )
  const totalTradesData = labels.map((s) => stats[s].total)
  const avgRrData = labels.map((s) =>
    stats[s].total > 0 ? Number((stats[s].sumRr / stats[s].total).toFixed(2)) : 0
  )
  const profitData = labels.map((s) => Number(stats[s].netPnl.toFixed(2)))

  return {
    labels,
    stats,
    winRateData,
    totalTradesData,
    avgRrData,
    profitData
  }
})

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
