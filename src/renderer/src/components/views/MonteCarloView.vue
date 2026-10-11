<template>
  <div class="p-8 w-full max-w-7xl mx-auto bg-gray-50/50 min-h-screen pb-24">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <i class="ph-bold ph-dice-five text-primary"></i>
          Monte Carlo Simulation
        </h1>
        <p class="text-gray-500 text-sm">
          Simulate future account equity, drawdown risk, and risk of ruin using Van Tharp's R-multiple bootstrap & Kevin Davey's risk metrics.
        </p>
      </div>

      <!-- Mode Switcher (Normal / BE / Trail) -->
      <div class="bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm flex font-semibold text-sm">
        <button
          type="button"
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
          type="button"
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
          type="button"
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

    <!-- 2. Filters Bar -->
    <TradeFiltersBar
      v-model="filters"
      :setups="setups"
      :symbols="symbols"
      :available-sessions="availableSessions"
      :report-custom-columns="reportCustomColumns"
      @reset="resetFilters"
    >
      <template #footer>
        <div class="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4 text-sm font-semibold">
            <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-gray-700">
              <span class="text-gray-400 font-normal">Matching Trades:</span>
              <span class="font-bold">{{ filteredTrades.length }}</span>
            </div>
            <div class="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg text-green-700">
              <span class="text-green-500 font-normal">Win Rate:</span>
              <span class="font-bold">{{ actualWinRate.toFixed(1) }}%</span>
            </div>
            <div class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg text-blue-700">
              <span class="text-blue-500 font-normal">Expectancy:</span>
              <span class="font-bold">{{ actualExpectancy >= 0 ? '+' : '' }}{{ actualExpectancy.toFixed(2) }}R</span>
            </div>
          </div>

          <!-- Warning banners -->
          <div
            v-if="filteredTrades.length < 2"
            class="text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 flex items-center gap-2"
          >
            <i class="ph-bold ph-warning-circle"></i>
            <span>ต้องมีอย่างน้อย 2 ไม้เพื่อรันการจำลอง</span>
          </div>
          <div
            v-else-if="filteredTrades.length < 30"
            class="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-2"
          >
            <i class="ph-bold ph-warning"></i>
            <span>ข้อมูลน้อย ผลลัพธ์ยังไม่น่าเชื่อถือ (แนะนำ 30+ ไม้, ดีที่สุด 100+)</span>
          </div>
        </div>
      </template>
    </TradeFiltersBar>

    <!-- 3. Simulation Settings Card -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <h2 class="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
        <i class="ph-bold ph-sliders text-blue-600 text-xl"></i>
        Simulation Parameters
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        <!-- Capital -->
        <div>
          <label class="block text-xs font-bold text-gray-500 mb-1.5">Initial Capital ($)</label>
          <input
            type="number"
            min="100"
            step="100"
            v-model.number="simSettings.initialCapital"
            class="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-2.5 font-bold outline-none focus:border-blue-500"
          />
        </div>

        <!-- Risk % -->
        <div>
          <label class="block text-xs font-bold text-gray-500 mb-1.5">Risk per Trade (%)</label>
          <input
            type="number"
            min="0.1"
            max="100"
            step="0.1"
            v-model.number="simSettings.riskPct"
            class="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-2.5 font-bold outline-none focus:border-blue-500"
          />
        </div>

        <!-- Return Calculation -->
        <div>
          <label class="block text-xs font-bold text-gray-500 mb-1.5">Return Calculation</label>
          <BaseSelect
            v-model="simSettings.returnCalculation"
            :options="[
              { label: 'Simple (Fixed Initial Risk)', value: 'simple' },
              { label: 'Log (Compounded Balance)', value: 'compounded' }
            ]"
          />
        </div>

        <!-- Method -->
        <div>
          <label class="block text-xs font-bold text-gray-500 mb-1.5">Simulation Method</label>
          <BaseSelect
            v-model="simSettings.method"
            :options="[
              { label: 'Bootstrap (with replacement)', value: 'bootstrap' },
              { label: 'Shuffle (without replacement)', value: 'shuffle' },
              { label: 'Block Bootstrap (contiguous)', value: 'block_bootstrap' }
            ]"
          />
        </div>

        <!-- Block Size (Conditional) -->
        <div v-if="simSettings.method === 'block_bootstrap'">
          <label class="block text-xs font-bold text-gray-500 mb-1.5">Block Size</label>
          <input
            type="number"
            min="2"
            max="20"
            v-model.number="simSettings.blockSize"
            class="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-2.5 font-bold outline-none focus:border-blue-500"
          />
        </div>

        <!-- Simulations Count -->
        <div>
          <label class="block text-xs font-bold text-gray-500 mb-1.5">Runs (Max 20,000)</label>
          <input
            type="number"
            min="100"
            max="20000"
            step="500"
            v-model.number="simSettings.simulationsCount"
            class="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-2.5 font-bold outline-none focus:border-blue-500"
          />
        </div>

        <!-- Trades per Run -->
        <div>
          <label class="block text-xs font-bold text-gray-500 mb-1.5">
            Trades per Run
            <span v-if="simSettings.method === 'shuffle'" class="text-gray-400 font-normal">(Locked for Shuffle)</span>
          </label>
          <input
            type="number"
            min="2"
            :disabled="simSettings.method === 'shuffle'"
            v-model.number="simSettings.tradesPerRun"
            :placeholder="String(filteredTrades.length)"
            class="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-2.5 font-bold outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <!-- Ruin Threshold % -->
        <div>
          <label class="block text-xs font-bold text-gray-500 mb-1.5">Ruin Threshold (%)</label>
          <div class="relative">
            <input
              type="number"
              max="-1"
              min="-99"
              v-model.number="simSettings.ruinThresholdPct"
              class="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-2.5 font-bold outline-none focus:border-blue-500"
            />
            <span class="absolute right-3 top-2.5 text-xs text-gray-400">
              ({{ ((100 + simSettings.ruinThresholdPct) / 100 * simSettings.initialCapital).toLocaleString() }}$)
            </span>
          </div>
        </div>

        <!-- Random Seed -->
        <div>
          <label class="block text-xs font-bold text-gray-500 mb-1.5">Random Seed</label>
          <div class="flex gap-2">
            <input
              type="number"
              v-model.number="simSettings.randomSeed"
              class="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-2.5 font-bold outline-none focus:border-blue-500"
            />
            <button
              type="button"
              @click="reseed"
              class="px-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors"
              title="Generate new random seed"
            >
              <i class="ph ph-shuffle text-lg"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Stress Test Accordion -->
      <div class="border border-gray-100 rounded-xl overflow-hidden mb-6">
        <button
          type="button"
          @click="isStressAccordionOpen = !isStressAccordionOpen"
          class="w-full px-4 py-3 bg-gray-50/80 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
        >
          <div class="flex items-center gap-2">
            <i class="ph-bold ph-shield-warning text-amber-500 text-lg"></i>
            <span class="font-bold text-sm text-gray-800">Stress Testing Scenarios</span>
            <span v-if="simSettings.stressTest.enabled" class="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">Active</span>
          </div>
          <i
            class="ph ph-caret-down transition-transform text-gray-400"
            :class="{ 'rotate-180': isStressAccordionOpen }"
          ></i>
        </button>

        <div v-if="isStressAccordionOpen" class="p-5 bg-white space-y-4 border-t border-gray-100">
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              v-model="simSettings.stressTest.enabled"
              class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
            />
            <span class="text-sm font-bold text-gray-700">Enable Adverse Stress Test Conditions</span>
          </label>

          <div v-if="simSettings.stressTest.enabled" class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1">
                Degrade Winning R by (%):
                <span class="text-blue-600 font-extrabold">{{ simSettings.stressTest.degradeWinPct }}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                v-model.number="simSettings.stressTest.degradeWinPct"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span class="text-[11px] text-gray-400">Simulate slippage or reduced execution on winners.</span>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1">
                Randomly Skip Trades (%):
                <span class="text-blue-600 font-extrabold">{{ simSettings.stressTest.skipTradePct }}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                v-model.number="simSettings.stressTest.skipTradePct"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span class="text-[11px] text-gray-400">Simulate missed entries or trading platform downtime.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Run Action & Progress -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
        <div class="w-full sm:w-auto flex-1 max-w-md">
          <div v-if="isRunning" class="space-y-1.5">
            <div class="flex justify-between text-xs font-bold text-gray-600">
              <span>Running Simulation in Web Worker...</span>
              <span>{{ progress }}%</span>
            </div>
            <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div
                class="bg-blue-600 h-full rounded-full transition-all duration-150"
                :style="{ width: `${progress}%` }"
              ></div>
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="runSimulation"
          :disabled="isRunning || filteredTrades.length < 2"
          class="w-full sm:w-auto px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <i v-if="!isRunning" class="ph-bold ph-play text-lg"></i>
          <span v-else class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
          <span>{{ isRunning ? 'Simulating...' : 'Run Simulation' }}</span>
        </button>
      </div>
    </div>

    <!-- Results Section (Displayed when result is available) -->
    <template v-if="result">
      <!-- 4. Key Summary Metric Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <!-- 1. Median Return -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Median Return</span>
          <div class="my-2">
            <span
              class="text-xl font-bold"
              :class="result.medianReturnPct >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ result.medianReturnPct >= 0 ? '+' : '' }}{{ result.medianReturnPct.toFixed(1) }}%
            </span>
          </div>
          <span class="text-[11px] text-gray-500">P50 expected return</span>
        </div>

        <!-- 2. P5 Return (Worst 5%) -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">P5 Return</span>
          <div class="my-2">
            <span
              class="text-xl font-bold"
              :class="result.p5ReturnPct >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ result.p5ReturnPct >= 0 ? '+' : '' }}{{ result.p5ReturnPct.toFixed(1) }}%
            </span>
          </div>
          <span class="text-[11px] text-gray-500">Worst 5% case return</span>
        </div>

        <!-- 3. Prob of Profit -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Prob. Profit</span>
          <div class="my-2">
            <span class="text-xl font-bold text-blue-600">
              {{ result.probabilityOfProfitPct.toFixed(1) }}%
            </span>
          </div>
          <span class="text-[11px] text-gray-500">Runs finishing &gt; Capital</span>
        </div>

        <!-- 4. Median Max DD -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Median Max DD</span>
          <div class="my-2">
            <span class="text-xl font-bold text-orange-600">
              -{{ result.medianMaxDDPct.toFixed(1) }}%
            </span>
          </div>
          <span class="text-[11px] text-gray-500">50th percentile DD</span>
        </div>

        <!-- 5. P95 Max DD (Worst 5% DD) -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">P95 Max DD</span>
          <div class="my-2">
            <span class="text-xl font-bold text-red-600">
              -{{ result.p95MaxDDPct.toFixed(1) }}%
            </span>
          </div>
          <span class="text-[11px] text-gray-500">Worst 5% peak-to-trough</span>
        </div>

        <!-- 6. Risk of Ruin -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Risk of Ruin</span>
          <div class="my-2">
            <span
              class="text-xl font-bold"
              :class="result.riskOfRuinPct === 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ result.riskOfRuinPct.toFixed(1) }}%
            </span>
          </div>
          <span class="text-[11px] text-gray-500">Touch &lt;= {{ simSettings.ruinThresholdPct }}%</span>
        </div>

        <!-- 7. P95 Max Consec Losses -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">P95 Consec Loss</span>
          <div class="my-2">
            <span class="text-xl font-bold text-purple-600">
              {{ result.p95MaxConsecLosses }}
            </span>
          </div>
          <span class="text-[11px] text-gray-500">Worst losing streak</span>
        </div>
      </div>

      <!-- 5. Equity Cone Chart -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <div>
            <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <i class="ph-bold ph-chart-line-up text-blue-600"></i>
              Equity Cone & Confidence Bands
            </h2>
            <p class="text-xs text-gray-500">
              Projected balance across {{ result.simulationsCount.toLocaleString() }} paths: Percentile 5 to 95 range with Actual Equity overlay.
            </p>
          </div>
          <!-- Legend Badges -->
          <div class="flex flex-wrap gap-2 text-[11px] font-semibold">
            <span class="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800">Actual Equity</span>
            <span class="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800">P50 (Median)</span>
            <span class="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600">P25 - P75 Band</span>
            <span class="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600">P5 - P95 Band</span>
          </div>
        </div>

        <div class="h-96 w-full">
          <Line :data="equityConeChartData" :options="equityConeChartOptions" />
        </div>
      </div>

      <!-- 6 & 7. Histograms: Max Drawdown & Final Balance -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Max DD Histogram -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="mb-4">
            <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <i class="ph-bold ph-trend-down text-red-500"></i>
              Max Drawdown Distribution
            </h2>
            <p class="text-xs text-gray-500">
              Median Max DD: {{ result.medianMaxDDPct.toFixed(1) }}% | P95 Max DD: {{ result.p95MaxDDPct.toFixed(1) }}%
            </p>
          </div>
          <div class="h-72 w-full">
            <Bar :data="maxDDHistogramChartData" :options="histogramChartOptions('Max Drawdown %')" />
          </div>
        </div>

        <!-- Final Balance Histogram -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="mb-4">
            <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <i class="ph-bold ph-wallet text-green-500"></i>
              Final Balance Distribution
            </h2>
            <p class="text-xs text-gray-500">
              Initial Capital: ${{ result.initialCapital.toLocaleString() }} | Median Final: ${{ Math.round(result.finalBalancePercentiles.p50).toLocaleString() }}
            </p>
          </div>
          <div class="h-72 w-full">
            <Bar :data="finalBalanceHistogramChartData" :options="histogramChartOptions('Final Balance $')" />
          </div>
        </div>
      </div>

      <!-- 8. Max Consecutive Losses Distribution -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div class="mb-4">
          <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            <i class="ph-bold ph-skull text-purple-600"></i>
            Max Consecutive Losses Distribution
          </h2>
          <p class="text-xs text-gray-500">
            Probability distribution of maximum losing streaks across simulation runs.
          </p>
        </div>
        <div class="h-64 w-full">
          <Bar :data="consecLossesChartData" :options="histogramChartOptions('Streak Length (Trades)')" />
        </div>
      </div>

      <!-- 9. Percentiles Summary Table -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-x-auto">
        <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <i class="ph-bold ph-table text-indigo-600"></i>
          Detailed Percentile Statistics
        </h2>

        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
              <th class="py-3 px-4">Metric</th>
              <th class="py-3 px-4 text-red-600">P5 (Worst 5%)</th>
              <th class="py-3 px-4 text-orange-600">P25 (Bottom 25%)</th>
              <th class="py-3 px-4 text-blue-600 font-extrabold">P50 (Median)</th>
              <th class="py-3 px-4 text-emerald-600">P75 (Top 25%)</th>
              <th class="py-3 px-4 text-green-600">P95 (Top 5%)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 font-medium text-gray-700">
            <tr>
              <td class="py-3.5 px-4 font-bold text-gray-900">Final Balance ($)</td>
              <td class="py-3.5 px-4">${{ Math.round(result.finalBalancePercentiles.p5).toLocaleString() }}</td>
              <td class="py-3.5 px-4">${{ Math.round(result.finalBalancePercentiles.p25).toLocaleString() }}</td>
              <td class="py-3.5 px-4 font-bold text-blue-600">${{ Math.round(result.finalBalancePercentiles.p50).toLocaleString() }}</td>
              <td class="py-3.5 px-4">${{ Math.round(result.finalBalancePercentiles.p75).toLocaleString() }}</td>
              <td class="py-3.5 px-4">${{ Math.round(result.finalBalancePercentiles.p95).toLocaleString() }}</td>
            </tr>
            <tr>
              <td class="py-3.5 px-4 font-bold text-gray-900">Total Return (%)</td>
              <td class="py-3.5 px-4" :class="result.returnPctPercentiles.p5 >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ result.returnPctPercentiles.p5 >= 0 ? '+' : '' }}{{ result.returnPctPercentiles.p5.toFixed(1) }}%
              </td>
              <td class="py-3.5 px-4" :class="result.returnPctPercentiles.p25 >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ result.returnPctPercentiles.p25 >= 0 ? '+' : '' }}{{ result.returnPctPercentiles.p25.toFixed(1) }}%
              </td>
              <td class="py-3.5 px-4 font-bold text-blue-600" :class="result.returnPctPercentiles.p50 >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ result.returnPctPercentiles.p50 >= 0 ? '+' : '' }}{{ result.returnPctPercentiles.p50.toFixed(1) }}%
              </td>
              <td class="py-3.5 px-4" :class="result.returnPctPercentiles.p75 >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ result.returnPctPercentiles.p75 >= 0 ? '+' : '' }}{{ result.returnPctPercentiles.p75.toFixed(1) }}%
              </td>
              <td class="py-3.5 px-4" :class="result.returnPctPercentiles.p95 >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ result.returnPctPercentiles.p95 >= 0 ? '+' : '' }}{{ result.returnPctPercentiles.p95.toFixed(1) }}%
              </td>
            </tr>
            <tr>
              <td class="py-3.5 px-4 font-bold text-gray-900">Max Drawdown (%)</td>
              <td class="py-3.5 px-4 text-green-600">-{{ result.maxDDPercentiles.p5.toFixed(1) }}%</td>
              <td class="py-3.5 px-4 text-emerald-600">-{{ result.maxDDPercentiles.p25.toFixed(1) }}%</td>
              <td class="py-3.5 px-4 font-bold text-blue-600">-{{ result.maxDDPercentiles.p50.toFixed(1) }}%</td>
              <td class="py-3.5 px-4 text-orange-600">-{{ result.maxDDPercentiles.p75.toFixed(1) }}%</td>
              <td class="py-3.5 px-4 text-red-600 font-bold">-{{ result.maxDDPercentiles.p95.toFixed(1) }}%</td>
            </tr>
            <tr>
              <td class="py-3.5 px-4 font-bold text-gray-900">Max Consecutive Losses</td>
              <td class="py-3.5 px-4">{{ Math.round(result.maxConsecLossesPercentiles.p5) }} trades</td>
              <td class="py-3.5 px-4">{{ Math.round(result.maxConsecLossesPercentiles.p25) }} trades</td>
              <td class="py-3.5 px-4 font-bold text-blue-600">{{ Math.round(result.maxConsecLossesPercentiles.p50) }} trades</td>
              <td class="py-3.5 px-4">{{ Math.round(result.maxConsecLossesPercentiles.p75) }} trades</td>
              <td class="py-3.5 px-4">{{ Math.round(result.maxConsecLossesPercentiles.p95) }} trades</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Disclaimer Note -->
      <div class="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
        หมายเหตุ: การจำลอง Monte Carlo อิงจากผลการเทรดในอดีต (Historical R-multiples) ไม่ได้รับประกันผลกำไรหรือความเสี่ยงในอนาคต
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseSelect from '../ui/BaseSelect.vue'
import TradeFiltersBar from '../ui/TradeFiltersBar.vue'
import { filterTrades, createDefaultFilters, TradeFiltersState } from '../../utils/tradeFilters'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions
} from 'chart.js'
import { Line, Bar } from 'vue-chartjs'
import {
  runMonteCarloSimulation,
  SimulationInput,
  SimulationResult,
  SimulationMethod,
  ReturnCalculation
} from '../../utils/monteCarlo'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const route = useRoute()

const statMode = ref<'normal' | 'be' | 'trail'>('normal')
const allTrades = ref<any[]>([])
const setups = ref<{ id: number; name: string }[]>([])
const symbols = ref<{ id: number; name: string }[]>([])

const allReportCustomColumns = ref<any[]>([])
const allSetupSessions = ref<string[]>([])

const filters = ref<TradeFiltersState>(createDefaultFilters())

const resetFilters = () => {
  filters.value = createDefaultFilters()
}

const reportCustomColumns = computed(() => {
  if (filters.value.setup === 'all') return []
  return allReportCustomColumns.value.filter(
    (c) => c.setupId.toString() === String(filters.value.setup)
  )
})

const availableSessions = computed(() => {
  const sessionSet = new Set<string>()
  allTrades.value.forEach((t) => {
    if (t.sessionName && t.sessionName.trim()) {
      sessionSet.add(t.sessionName.trim())
    }
  })
  allSetupSessions.value.forEach((s) => {
    if (s && s.trim()) sessionSet.add(s.trim())
  })
  if (sessionSet.size === 0) {
    ;['London', 'New York', 'Asia'].forEach((s) => sessionSet.add(s))
  }
  return [
    { label: 'All Sessions', value: 'all' },
    ...Array.from(sessionSet).map((s) => ({ label: s, value: s }))
  ]
})

const isStressAccordionOpen = ref(false)
const isRunning = ref(false)
const progress = ref(0)
const result = ref<SimulationResult | null>(null)

const LOCAL_STORAGE_KEY = 'mc_sim_settings'

const simSettings = ref({
  initialCapital: 10000,
  riskPct: 1.0,
  returnCalculation: 'simple' as ReturnCalculation,
  method: 'bootstrap' as SimulationMethod,
  blockSize: 3,
  simulationsCount: 5000,
  tradesPerRun: null as number | null,
  ruinThresholdPct: -30,
  randomSeed: 12345,
  stressTest: {
    enabled: false,
    degradeWinPct: 15,
    skipTradePct: 5
  }
})

const reseed = () => {
  simSettings.value.randomSeed = Math.floor(Math.random() * 900000) + 100000
}

onMounted(async () => {
  // Load saved settings from localStorage
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      simSettings.value = { ...simSettings.value, ...parsed }
    }
  } catch (e) {
    // ignore
  }

  // Parse Query Params if navigated from Reports/Dashboard
  if (route.query.mode) statMode.value = route.query.mode as any
  if (route.query.setup) filters.value.setup = route.query.setup as string
  if (route.query.symbol) filters.value.symbol = route.query.symbol as string
  if (route.query.session) filters.value.session = route.query.session as string
  if (route.query.includePaperTrades !== undefined) {
    filters.value.includePaperTrades = route.query.includePaperTrades === 'true'
  }
  if (route.query.from) filters.value.startDate = route.query.from as string
  if (route.query.to) filters.value.endDate = route.query.to as string
  Object.keys(route.query).forEach((key) => {
    if (key.startsWith('cf_')) {
      const colId = key.slice(3)
      filters.value.customFields[colId] = route.query[key] as string
    }
  })

  // Fetch setups & symbols & journal entries
  try {
    if (typeof window !== 'undefined' && window.api) {
      const [tradesRes, setupsRes, symbolsRes] = await Promise.all([
        window.api.journal.list(),
        window.api.setups.list(),
        window.api.symbols.list()
      ])
      if (tradesRes?.success) allTrades.value = tradesRes.data || []
      if (setupsRes?.success) setups.value = setupsRes.data || []
      if (symbolsRes?.success) symbols.value = symbolsRes.data || []

      // Fetch report_filter custom columns and sessions from setups
      const cols: any[] = []
      const setupSessionsSet = new Set<string>()
      for (const setup of setups.value) {
        const details = await window.api.setups.getDetails(setup.id)
        if (details.success) {
          if (details.data.customColumns) {
            cols.push(...details.data.customColumns.filter((c: any) => c.reportFilter))
          }
          if (Array.isArray(details.data.sessions)) {
            details.data.sessions.forEach((s: any) => {
              const name = s.sessionName || (typeof s === 'string' ? s : s?.name)
              if (name && name.trim()) setupSessionsSet.add(name.trim())
            })
          }
        }
      }
      allReportCustomColumns.value = cols
      allSetupSessions.value = Array.from(setupSessionsSet)
    }
  } catch (err) {
    console.error('Failed to load trades for Monte Carlo:', err)
  }
})

const getTradeR = (trade: any): number => {
  if (statMode.value === 'normal') return Number(trade.normalRr || 0)
  if (statMode.value === 'be') return Number(trade.beRr || 0)
  if (statMode.value === 'trail') return Number(trade.trailRr || 0)
  return 0
}

const filteredTrades = computed(() => {
  return filterTrades(allTrades.value, filters.value, reportCustomColumns.value)
})

const actualWinRate = computed(() => {
  if (filteredTrades.value.length === 0) return 0
  const wins = filteredTrades.value.filter((t) => getTradeR(t) > 0).length
  return (wins / filteredTrades.value.length) * 100
})

const actualExpectancy = computed(() => {
  if (filteredTrades.value.length === 0) return 0
  const sumR = filteredTrades.value.reduce((acc, t) => acc + getTradeR(t), 0)
  return sumR / filteredTrades.value.length
})

watch(
  () => filteredTrades.value.length,
  (newCount) => {
    if (!simSettings.value.tradesPerRun) {
      simSettings.value.tradesPerRun = newCount
    }
  }
)

const runInlineFallback = (simInput: SimulationInput) => {
  setTimeout(() => {
    try {
      result.value = runMonteCarloSimulation(simInput)
    } catch (err) {
      console.error('Simulation error:', err)
    } finally {
      isRunning.value = false
    }
  }, 50)
}

const runSimulation = () => {
  if (filteredTrades.value.length < 2) return
  isRunning.value = true
  progress.value = 0

  const rMultiples = filteredTrades.value.map((t) => getTradeR(t))
  const tradesPerRun =
    simSettings.value.method === 'shuffle'
      ? rMultiples.length
      : simSettings.value.tradesPerRun || rMultiples.length

  const simInput: SimulationInput = {
    rMultiples,
    initialCapital: simSettings.value.initialCapital,
    riskPct: simSettings.value.riskPct,
    returnCalculation: simSettings.value.returnCalculation,
    method: simSettings.value.method,
    blockSize: simSettings.value.blockSize,
    simulationsCount: simSettings.value.simulationsCount,
    tradesPerRun,
    ruinThresholdPct: simSettings.value.ruinThresholdPct,
    randomSeed: simSettings.value.randomSeed,
    stressTest: simSettings.value.stressTest
  }

  // Persist settings
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(simSettings.value))
  } catch (e) {
    // ignore
  }

  try {
    const worker = new Worker(new URL('../../workers/monteCarlo.worker.ts', import.meta.url), {
      type: 'module'
    })

    worker.onmessage = (e) => {
      if (e.data.type === 'PROGRESS') {
        progress.value = e.data.progress
      } else if (e.data.type === 'RESULT') {
        result.value = e.data.data
        isRunning.value = false
        worker.terminate()
      } else if (e.data.type === 'ERROR') {
        console.error('Worker error:', e.data.error)
        isRunning.value = false
        worker.terminate()
      }
    }

    worker.onerror = (err) => {
      console.warn('Worker error, running fallback:', err)
      worker.terminate()
      runInlineFallback(simInput)
    }

    worker.postMessage({ type: 'START', input: simInput })
  } catch (err) {
    runInlineFallback(simInput)
  }
}

// 5. Equity Cone Chart Data
const equityConeChartData = computed(() => {
  if (!result.value) return { labels: [], datasets: [] }
  const cone = result.value.equityCone
  const labels = cone.map((c) => `#${c.tradeIndex}`)

  return {
    labels,
    datasets: [
      // 0: P95
      {
        label: 'P95 (Top 5%)',
        data: cone.map((c) => Math.round(c.p95)),
        borderColor: 'rgba(99, 102, 241, 0.4)',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false
      },
      // 1: P75
      {
        label: 'P75',
        data: cone.map((c) => Math.round(c.p75)),
        borderColor: 'rgba(99, 102, 241, 0.7)',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false
      },
      // 2: P50 (Median)
      {
        label: 'P50 (Median)',
        data: cone.map((c) => Math.round(c.p50)),
        borderColor: '#4f46e5',
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        pointRadius: 0,
        fill: false
      },
      // 3: P25 (fills to P75 at index 1)
      {
        label: 'P25',
        data: cone.map((c) => Math.round(c.p25)),
        borderColor: 'rgba(99, 102, 241, 0.7)',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderWidth: 1.5,
        pointRadius: 0,
        fill: 1
      },
      // 4: P5 (fills to P95 at index 0)
      {
        label: 'P5 (Worst 5%)',
        data: cone.map((c) => Math.round(c.p5)),
        borderColor: 'rgba(99, 102, 241, 0.4)',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        borderWidth: 1.5,
        pointRadius: 0,
        fill: 0
      },
      // 5: Actual Equity
      {
        label: 'Actual Equity',
        data: cone.map((c) => (c.actual !== undefined ? Math.round(c.actual) : null)),
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        pointRadius: 0,
        borderDash: [4, 4],
        fill: false
      }
    ]
  }
})

const equityConeChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context: any) => `${context.dataset.label}: $${Number(context.raw).toLocaleString()}`
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxTicksLimit: 12 }
    },
    y: {
      grid: { color: '#f3f4f6' },
      ticks: {
        callback: (value: any) => `$${Number(value).toLocaleString()}`
      }
    }
  }
}

// 6. Max Drawdown Histogram
const maxDDHistogramChartData = computed(() => {
  if (!result.value) return { labels: [], datasets: [] }
  const bins = result.value.maxDDHistogram
  return {
    labels: bins.map((b) => b.label),
    datasets: [
      {
        label: 'Frequency %',
        data: bins.map((b) => b.frequency),
        backgroundColor: '#ef4444',
        borderRadius: 4
      }
    ]
  }
})

// 7. Final Balance Histogram
const finalBalanceHistogramChartData = computed(() => {
  if (!result.value) return { labels: [], datasets: [] }
  const bins = result.value.finalBalanceHistogram
  return {
    labels: bins.map((b) => b.label),
    datasets: [
      {
        label: 'Frequency %',
        data: bins.map((b) => b.frequency),
        backgroundColor: '#10b981',
        borderRadius: 4
      }
    ]
  }
})

// 8. Max Consecutive Losses Bar Chart
const consecLossesChartData = computed(() => {
  if (!result.value) return { labels: [], datasets: [] }
  const items = result.value.maxConsecLossesHistogram
  return {
    labels: items.map((i) => `${i.consecutiveLosses} losses`),
    datasets: [
      {
        label: 'Frequency %',
        data: items.map((i) => i.frequency),
        backgroundColor: '#8b5cf6',
        borderRadius: 4
      }
    ]
  }
})

const histogramChartOptions = (yTitle: string): ChartOptions<'bar'> => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: any) => `${context.parsed.y}% of simulation runs`
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxRotation: 45, minRotation: 0, font: { size: 10 } }
    },
    y: {
      grid: { color: '#f3f4f6' },
      title: { display: true, text: yTitle, font: { size: 11, weight: 'bold' as const } },
      ticks: { callback: (v: any) => `${v}%` }
    }
  }
})
</script>
