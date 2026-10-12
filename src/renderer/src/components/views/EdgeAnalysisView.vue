<template>
  <div class="p-8 w-full max-w-7xl mx-auto bg-gray-50/50 min-h-screen pb-24">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <i class="ph-bold ph-crosshair text-primary"></i>
          Edge Analysis
        </h1>
        <p class="text-gray-500 text-sm">
          วิเคราะห์ความได้เปรียบในการเทรด: เปรียบเทียบ Setup อิสระแบบหลายเงื่อนไข (Multi-Cohort
          Comparison), การกระจายตัวของ R-Multiple, จังหวะเวลา วัน × ชั่วโมง, และความคุ้มค่า MAE /
          MFE
        </p>
      </div>

      <!-- Mode Switcher (Normal / BE / Trail) -->
      <div
        class="bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm flex font-semibold text-sm"
      >
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

    <!-- ========================================================================= -->
    <!-- DYNAMIC MULTI-COHORT SETUP FILTERS (เพิ่มปุ่มเพิ่ม filter ไม่จำกัด)         -->
    <!-- ========================================================================= -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-base font-bold text-gray-900 flex items-center gap-2">
              <i class="ph-bold ph-sliders-horizontal text-primary"></i>
              Setup Comparison Filters (กำหนดเงื่อนไขเพื่อเปรียบเทียบ)
            </h2>
            <span
              class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20"
            >
              {{ cohorts.length }} Setup{{ cohorts.length > 1 ? 's' : '' }} Compared
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            เพิ่ม Setup ที่ต้องการเปรียบเทียบได้ไม่จำกัด (เช่น เพิ่ม 2 ตัวเลือกเพื่อเทียบ 2 Setup)
            แต่ละ Setup สามารถกำหนด Symbol, Session, วันที่ และ Custom Columns ได้อย่างอิสระ
          </p>
        </div>

        <!-- Add Setup Button -->
        <button
          type="button"
          @click="addCohort"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primaryHover text-white font-semibold text-xs rounded-xl shadow-xs transition-all duration-150 cursor-pointer"
        >
          <i class="ph-bold ph-plus text-sm"></i>
          <span>เพิ่ม Setup เปรียบเทียบ (+ Add Setup Filter)</span>
        </button>
      </div>

      <!-- Cohorts Cards Grid -->
      <div class="space-y-4">
        <div
          v-for="(cohort, idx) in cohorts"
          :key="cohort.id"
          class="p-5 rounded-2xl border-2 transition-all duration-150 bg-white"
          :style="{ borderColor: cohort.color.border + '40' }"
        >
          <!-- Cohort Card Header -->
          <div
            class="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-gray-100 gap-2"
          >
            <div class="flex items-center gap-2.5">
              <!-- Color Dot / Pill -->
              <div
                class="w-3.5 h-3.5 rounded-full shadow-2xs"
                :style="{ backgroundColor: cohort.color.bg }"
              ></div>
              <span class="font-bold text-sm text-gray-900">
                Setup #{{ idx + 1 }}:
                <span :style="{ color: cohort.color.text }">{{ cohort.name }}</span>
              </span>
              <span
                class="px-2 py-0.5 rounded-md text-[11px] font-bold"
                :class="cohort.color.badgeBg + ' ' + cohort.color.badgeText"
              >
                {{ cohortsWithTrades[idx]?.trades.length || 0 }} trades
              </span>
            </div>

            <!-- Remove Button -->
            <button
              v-if="cohorts.length > 1"
              type="button"
              @click="removeCohort(idx)"
              class="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="ลบตัวกรอง Setup นี้"
            >
              <i class="ph-bold ph-trash text-sm"></i>
              <span>ลบ</span>
            </button>
          </div>

          <!-- Cohort Filter Inputs -->
          <div class="flex flex-wrap gap-4 items-end">
            <!-- Setup Selector -->
            <div class="flex flex-col gap-1 min-w-[170px]">
              <label class="text-xs font-bold text-gray-500">Setup</label>
              <BaseSelect
                v-model="cohort.filters.setup"
                :options="[
                  { label: 'All Setups', value: 'all' },
                  ...setups.map((s) => ({ label: s.name, value: s.id }))
                ]"
                @update:model-value="() => onCohortSetupChange(cohort)"
              />
            </div>

            <!-- Symbol Selector -->
            <div class="flex flex-col gap-1 min-w-[140px]">
              <label class="text-xs font-bold text-gray-500">Symbol</label>
              <BaseSelect
                v-model="cohort.filters.symbol"
                :options="[
                  { label: 'All Symbols', value: 'all' },
                  ...symbols.map((s) => ({ label: s.name, value: s.id }))
                ]"
              />
            </div>

            <!-- Session Selector -->
            <div class="flex flex-col gap-1 min-w-[140px]">
              <label class="text-xs font-bold text-gray-500">Session</label>
              <BaseSelect v-model="cohort.filters.session" :options="availableSessions" />
            </div>

            <!-- Paper Trades Toggle -->
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-gray-500">Paper Trades</label>
              <label
                class="flex items-center gap-2 h-[38px] px-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors select-none"
              >
                <input
                  type="checkbox"
                  v-model="cohort.filters.includePaperTrades"
                  class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                />
                <span class="text-xs font-semibold text-gray-700 whitespace-nowrap"
                  >Include Paper</span
                >
              </label>
            </div>

            <!-- From Date -->
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-gray-500">From</label>
              <input
                type="date"
                v-model="cohort.filters.startDate"
                class="w-32 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-blue-500"
              />
            </div>

            <!-- To Date -->
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-gray-500">To</label>
              <input
                type="date"
                v-model="cohort.filters.endDate"
                class="w-32 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-blue-500"
              />
            </div>

            <!-- Reset Filters for this Cohort -->
            <button
              type="button"
              @click="resetCohortFilters(cohort)"
              class="text-xs text-gray-400 hover:text-gray-600 font-semibold h-[38px] flex items-center gap-1 ml-auto cursor-pointer"
              title="ล้างค่าตัวกรองของ Setup นี้"
            >
              <i class="ph-bold ph-arrow-counter-clockwise"></i> Reset
            </button>
          </div>

          <!-- Setup Custom Columns Row (if setup selected and has report custom columns) -->
          <div
            v-if="cohort.customColumns && cohort.customColumns.length > 0"
            class="flex flex-wrap gap-4 items-end pt-4 mt-4 border-t border-gray-100"
          >
            <div
              class="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 h-[38px] flex items-center"
            >
              Custom
            </div>
            <template v-for="col in cohort.customColumns" :key="col.id">
              <div class="flex flex-col gap-1">
                <label class="text-xs font-bold text-gray-500">{{ col.name }}</label>
                <BaseSelect
                  v-if="col.type === 'single_selector' || col.type === 'multiple_selector'"
                  v-model="cohort.filters.customFields[col.id]"
                  :options="[
                    { label: 'All', value: 'all' },
                    ...(typeof col.options === 'string'
                      ? JSON.parse(col.options)
                      : col.options || []
                    ).map((o: any) => ({ label: o, value: o }))
                  ]"
                />
                <BaseSelect
                  v-else-if="col.type === 'switch' || col.type === 'checkbox'"
                  v-model="cohort.filters.customFields[col.id]"
                  :options="[
                    { label: 'All', value: 'all' },
                    { label: 'Yes', value: 'true' },
                    { label: 'No', value: 'false' }
                  ]"
                />
                <input
                  v-else-if="col.type === 'string'"
                  type="text"
                  v-model="cohort.filters.customFields[col.id]"
                  :placeholder="'Filter...'"
                  class="w-32 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-blue-500"
                />
                <input
                  v-else-if="col.type === 'number'"
                  type="number"
                  step="any"
                  v-model="cohort.filters.customFields[col.id]"
                  :placeholder="'Filter...'"
                  class="w-32 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:border-blue-500"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- HEAD-TO-HEAD COMPARISON HERO (เมื่อเทียบ 2 Setup)                           -->
    <!-- ========================================================================= -->
    <div
      v-if="cohortPerformance.headToHeadDelta && cohortPerformance.items.length === 2"
      class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8"
    >
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-2">
        <div>
          <h2 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <i class="ph-bold ph-scales text-primary"></i>
            Head-to-Head Setup Comparison (ศึกประชัน Edge)
          </h2>
          <p class="text-xs text-gray-500 mt-0.5">
            เปรียบเทียบสถิติตัวต่อตัวระหว่าง 2 Setup ที่เลือก เพื่อวิเคราะห์ผลต่าง (Delta) และเฟ้นหา
            Setup ที่ทำเงินจริง
          </p>
        </div>
        <span
          class="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200/60"
        >
          Comparing 2 Setups
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
        <!-- Setup 1 Card -->
        <div
          class="md:col-span-5 p-5 rounded-2xl border-2 transition-all duration-150 bg-gradient-to-br from-white to-gray-50/50 shadow-xs"
          :style="{ borderColor: cohortPerformance.items[0].color + '40' }"
          :class="{ 'ring-2 ring-emerald-500/30': cohortPerformance.items[0].isBestExpectancy }"
        >
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-2 min-w-0">
              <span
                class="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-2xs"
                :style="{ backgroundColor: cohortPerformance.items[0].color }"
              ></span>
              <span class="font-bold text-base text-gray-900 truncate">
                {{ cohortPerformance.items[0].name }}
              </span>
            </div>
            <span
              v-if="cohortPerformance.items[0].isBestExpectancy"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex-shrink-0"
            >
              👑 Higher Expectancy
            </span>
          </div>
          <div class="text-xs text-gray-400 mb-4 truncate pl-5">
            {{ cohortPerformance.items[0].filterSummary }}
          </div>
          <div class="grid grid-cols-4 gap-2 text-center pt-3 border-t border-gray-100">
            <div>
              <span class="text-[10px] font-bold text-gray-400 block uppercase">Trades</span>
              <span class="font-extrabold text-base text-gray-900">{{
                cohortPerformance.items[0].totalTrades
              }}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-gray-400 block uppercase">Win Rate</span>
              <span class="font-extrabold text-base text-emerald-600"
                >{{ cohortPerformance.items[0].winRate }}%</span
              >
            </div>
            <div>
              <span class="text-[10px] font-bold text-gray-400 block uppercase">Expectancy</span>
              <span
                class="font-extrabold text-base"
                :class="cohortPerformance.items[0].avgRr >= 0 ? 'text-primary' : 'text-red-600'"
              >
                {{ cohortPerformance.items[0].avgRr >= 0 ? '+' : ''
                }}{{ cohortPerformance.items[0].avgRr }}R
              </span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-gray-400 block uppercase">PF</span>
              <span class="font-extrabold text-base text-gray-900">{{
                cohortPerformance.items[0].profitFactor
              }}</span>
            </div>
          </div>
        </div>

        <!-- Center VS Badge -->
        <div class="md:col-span-1 flex flex-col items-center justify-center text-center">
          <div
            class="w-10 h-10 rounded-full bg-gray-100 text-gray-700 font-extrabold text-xs flex items-center justify-center border border-gray-200 shadow-xs"
          >
            VS
          </div>
        </div>

        <!-- Setup 2 Card -->
        <div
          class="md:col-span-5 p-5 rounded-2xl border-2 transition-all duration-150 bg-gradient-to-br from-white to-gray-50/50 shadow-xs"
          :style="{ borderColor: cohortPerformance.items[1].color + '40' }"
          :class="{ 'ring-2 ring-emerald-500/30': cohortPerformance.items[1].isBestExpectancy }"
        >
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-2 min-w-0">
              <span
                class="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-2xs"
                :style="{ backgroundColor: cohortPerformance.items[1].color }"
              ></span>
              <span class="font-bold text-base text-gray-900 truncate">
                {{ cohortPerformance.items[1].name }}
              </span>
            </div>
            <span
              v-if="cohortPerformance.items[1].isBestExpectancy"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex-shrink-0"
            >
              👑 Higher Expectancy
            </span>
          </div>
          <div class="text-xs text-gray-400 mb-4 truncate pl-5">
            {{ cohortPerformance.items[1].filterSummary }}
          </div>
          <div class="grid grid-cols-4 gap-2 text-center pt-3 border-t border-gray-100">
            <div>
              <span class="text-[10px] font-bold text-gray-400 block uppercase">Trades</span>
              <span class="font-extrabold text-base text-gray-900">{{
                cohortPerformance.items[1].totalTrades
              }}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-gray-400 block uppercase">Win Rate</span>
              <span class="font-extrabold text-base text-emerald-600"
                >{{ cohortPerformance.items[1].winRate }}%</span
              >
            </div>
            <div>
              <span class="text-[10px] font-bold text-gray-400 block uppercase">Expectancy</span>
              <span
                class="font-extrabold text-base"
                :class="cohortPerformance.items[1].avgRr >= 0 ? 'text-primary' : 'text-red-600'"
              >
                {{ cohortPerformance.items[1].avgRr >= 0 ? '+' : ''
                }}{{ cohortPerformance.items[1].avgRr }}R
              </span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-gray-400 block uppercase">PF</span>
              <span class="font-extrabold text-base text-gray-900">{{
                cohortPerformance.items[1].profitFactor
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Delta Summary Bar -->
      <div
        class="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs gap-3"
      >
        <div class="flex items-center gap-3 flex-wrap">
          <span class="text-gray-400 font-bold uppercase text-[11px]"
            >ผลต่าง (Delta #1 vs #2):</span
          >
          <span class="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200/80 text-gray-700">
            Expectancy:
            <strong
              :class="
                cohortPerformance.headToHeadDelta.expectancyDiff >= 0
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              "
            >
              {{ cohortPerformance.headToHeadDelta.expectancyDiff >= 0 ? '+' : ''
              }}{{ cohortPerformance.headToHeadDelta.expectancyDiff }}R
            </strong>
          </span>
          <span class="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200/80 text-gray-700">
            Win Rate:
            <strong
              :class="
                cohortPerformance.headToHeadDelta.winRateDiff >= 0
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              "
            >
              {{ cohortPerformance.headToHeadDelta.winRateDiff >= 0 ? '+' : ''
              }}{{ cohortPerformance.headToHeadDelta.winRateDiff }}%
            </strong>
          </span>
          <span class="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200/80 text-gray-700">
            Profit Factor:
            <strong
              :class="
                cohortPerformance.headToHeadDelta.profitFactorDiff >= 0
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              "
            >
              {{ cohortPerformance.headToHeadDelta.profitFactorDiff >= 0 ? '+' : ''
              }}{{ cohortPerformance.headToHeadDelta.profitFactorDiff }}
            </strong>
          </span>
          <span class="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200/80 text-gray-700">
            Net R:
            <strong
              :class="
                cohortPerformance.headToHeadDelta.netRrDiff >= 0
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              "
            >
              {{ cohortPerformance.headToHeadDelta.netRrDiff >= 0 ? '+' : ''
              }}{{ cohortPerformance.headToHeadDelta.netRrDiff }}R
            </strong>
          </span>
        </div>
        <div
          class="px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5"
        >
          <span>🏆</span>
          <span>
            <strong>{{
              cohortPerformance.headToHeadDelta.expectancyDiff >= 0
                ? cohortPerformance.items[0].name
                : cohortPerformance.items[1].name
            }}</strong>
            มี Edge สูงกว่า (+{{ Math.abs(cohortPerformance.headToHeadDelta.expectancyDiff) }}R/ไม้)
          </span>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 1. FEATURE: Performance by Setup (ตารางเปรียบเทียบตามตัวกรองที่เลือก)       -->
    <!-- ========================================================================= -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <i class="ph-bold ph-table text-primary"></i>
            Performance by Setup (ตารางเทียบ Setup ที่เลือก)
          </h2>
          <p class="text-xs text-gray-500 mt-0.5">
            เปรียบเทียบสถิติของ Setup ที่คุณเลือกด้านบนแบบตัวต่อตัว (WR, Expectancy, PF, จำนวนไม้)
            เพื่อดูว่า setup ไหนทำเงินจริง
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-xs text-gray-400 font-semibold">เรียงตาม:</div>
          <select
            v-model="setupSortKey"
            class="bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 rounded-lg p-2 outline-none focus:border-blue-500"
          >
            <option value="avgRr">Expectancy (Avg R)</option>
            <option value="winRate">Win Rate (%)</option>
            <option value="profitFactor">Profit Factor (PF)</option>
            <option value="totalTrades">จำนวนไม้ (Trades)</option>
            <option value="totalRr">Net Total R</option>
          </select>
        </div>
      </div>

      <!-- Setup Comparison Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr
              class="border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50"
            >
              <th class="py-3.5 px-4 rounded-l-xl">Setup / Filter Set</th>
              <th class="py-3.5 px-4 text-center">Trades (ไม้)</th>
              <th class="py-3.5 px-4 text-center">Win Rate</th>
              <th class="py-3.5 px-4 text-center">W / L / BE</th>
              <th class="py-3.5 px-4 text-right">Expectancy (R)</th>
              <th class="py-3.5 px-4 text-center">Profit Factor</th>
              <th class="py-3.5 px-4 text-right">Net R</th>
              <th class="py-3.5 px-4 text-right">Avg Win / Loss</th>
              <th class="py-3.5 px-4 text-right">Avg MFE</th>
              <th class="py-3.5 px-4 text-center rounded-r-xl">Edge Quality</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 font-medium text-gray-700">
            <tr
              v-for="item in sortedCohortItems"
              :key="item.id"
              class="hover:bg-gray-50/80 transition-colors"
              :class="{ 'bg-emerald-50/30': item.isBestExpectancy }"
            >
              <!-- Setup Name & Color -->
              <td class="py-4 px-4 font-bold text-gray-900">
                <div class="flex items-center gap-2 mb-0.5">
                  <span
                    class="w-3 h-3 rounded-full flex-shrink-0"
                    :style="{ backgroundColor: item.color }"
                  ></span>
                  <span>{{ item.name }}</span>
                  <span
                    v-if="item.isBestExpectancy"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200"
                    title="Best Expectancy Setup"
                  >
                    🏆 Best Edge
                  </span>
                  <span
                    v-else-if="item.isBestProfitFactor"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200"
                    title="Highest Profit Factor"
                  >
                    💎 Best PF
                  </span>
                </div>
                <div
                  class="text-[11px] font-normal text-gray-400 pl-5 truncate max-w-xs"
                  :title="item.filterSummary"
                >
                  {{ item.filterSummary }}
                </div>
              </td>

              <!-- Total Trades & Share -->
              <td class="py-4 px-4 text-center">
                <div class="font-bold text-gray-900">{{ item.totalTrades }}</div>
                <div class="text-[11px] text-gray-400">{{ item.share }}% share</div>
              </td>

              <!-- Win Rate -->
              <td class="py-4 px-4 text-center">
                <div
                  class="inline-flex items-center gap-1.5 font-bold"
                  :class="item.winRate >= 50 ? 'text-emerald-600' : 'text-gray-700'"
                >
                  <span>{{ item.winRate.toFixed(1) }}%</span>
                </div>
                <div class="w-16 h-1.5 bg-gray-100 rounded-full mx-auto mt-1 overflow-hidden">
                  <div
                    class="h-full rounded-full"
                    :class="item.winRate >= 50 ? 'bg-emerald-500' : 'bg-amber-500'"
                    :style="{ width: `${Math.min(100, item.winRate)}%` }"
                  ></div>
                </div>
              </td>

              <!-- Wins / Losses / BE -->
              <td class="py-4 px-4 text-center text-xs">
                <span class="text-emerald-600 font-bold">{{ item.wins }}W</span>
                <span class="text-gray-300 mx-1">/</span>
                <span class="text-red-600 font-bold">{{ item.losses }}L</span>
                <span class="text-gray-300 mx-1">/</span>
                <span class="text-gray-500 font-bold">{{ item.breakEvens }}BE</span>
              </td>

              <!-- Expectancy (Avg R) -->
              <td class="py-4 px-4 text-right">
                <span
                  class="inline-block px-2.5 py-1 rounded-lg font-bold text-xs"
                  :class="
                    item.avgRr > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.avgRr < 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-700'
                  "
                >
                  {{ item.avgRr >= 0 ? '+' : '' }}{{ item.avgRr.toFixed(2) }}R
                </span>
              </td>

              <!-- Profit Factor -->
              <td class="py-4 px-4 text-center">
                <span
                  class="font-bold text-xs px-2 py-0.5 rounded-md"
                  :class="
                    item.profitFactor >= 2.0
                      ? 'text-emerald-700 bg-emerald-50'
                      : item.profitFactor >= 1.2
                        ? 'text-blue-700 bg-blue-50'
                        : 'text-gray-600 bg-gray-50'
                  "
                >
                  {{ item.profitFactor >= 999 ? '∞' : item.profitFactor.toFixed(2) }}
                </span>
              </td>

              <!-- Net R -->
              <td
                class="py-4 px-4 text-right font-bold"
                :class="item.totalRr >= 0 ? 'text-emerald-600' : 'text-red-600'"
              >
                {{ item.totalRr >= 0 ? '+' : '' }}{{ item.totalRr.toFixed(2) }}R
              </td>

              <!-- Avg Win / Loss -->
              <td class="py-4 px-4 text-right text-xs">
                <span class="text-emerald-600 font-bold">+{{ item.avgWinRr.toFixed(1) }}R</span>
                <span class="text-gray-300 mx-1">/</span>
                <span class="text-red-600 font-bold">-{{ item.avgLossRr.toFixed(1) }}R</span>
              </td>

              <!-- Avg MFE -->
              <td class="py-4 px-4 text-right text-xs font-semibold text-gray-700">
                {{ item.avgMaxRr !== null ? `+${item.avgMaxRr.toFixed(1)}R` : '-' }}
              </td>

              <!-- Edge Quality Assessment -->
              <td class="py-4 px-4 text-center">
                <span v-if="item.totalTrades === 0" class="text-xs text-gray-400"> No data </span>
                <span
                  v-else-if="item.avgRr >= 0.5 && item.profitFactor >= 1.5"
                  class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-800"
                >
                  Strong Edge
                </span>
                <span
                  v-else-if="item.avgRr > 0"
                  class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800"
                >
                  Moderate Edge
                </span>
                <span
                  v-else
                  class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800"
                >
                  Negative Edge
                </span>
              </td>
            </tr>

            <tr v-if="sortedCohortItems.length === 0">
              <td colspan="10" class="py-8 text-center text-gray-400 text-sm">
                ไม่พบข้อมูลสำหรับเงื่อนไขที่เลือก
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 2. FEATURE: R-Multiple Distribution (Histogram เทียบกัน)                   -->
    <!-- ========================================================================= -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <div>
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <i class="ph-bold ph-chart-bar text-primary"></i>
            R-Multiple Distribution (เปรียบเทียบการกระจายกำไร)
          </h2>
          <p class="text-xs text-gray-500 mt-0.5">
            Histogram เปรียบเทียบผลแต่ละไม้ (-1R, 1R, 2R, 3.5R…) ระหว่าง Setup ที่เลือก
            เพื่อดูว่ากำไรมาจากไม้ใหญ่ไม่กี่ไม้หรือกระจายสม่ำเสมอ
          </p>
        </div>

        <!-- Legend / Cohort Badges -->
        <div class="flex items-center gap-2 flex-wrap text-xs font-semibold">
          <span
            v-for="item in cohortsWithTrades"
            :key="item.id"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-md border"
            :style="{ borderColor: item.color + '40', color: item.color }"
          >
            <span
              class="w-2.5 h-2.5 rounded-full inline-block"
              :style="{ backgroundColor: item.color }"
            ></span>
            {{ item.name }}
          </span>
        </div>
      </div>

      <!-- Chart and Insights -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Multi-Bar Chart -->
        <div class="lg:col-span-2 h-72 w-full">
          <Bar :data="rDistributionChartData" :options="rDistributionChartOptions" />
        </div>

        <!-- Distribution Insights Card -->
        <div
          class="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 flex flex-col justify-between"
        >
          <div>
            <h3 class="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <i class="ph-bold ph-lightbulb text-amber-500"></i>
              Distribution Insights
            </h3>

            <div class="space-y-3 text-xs text-gray-600">
              <div
                v-for="cDist in cohortDistributions"
                :key="cDist.cohortId"
                class="pb-2.5 border-b border-gray-200/60 last:border-0"
              >
                <div class="font-bold text-gray-900 flex items-center gap-1.5 mb-1">
                  <span
                    class="w-2 h-2 rounded-full"
                    :style="{ backgroundColor: cDist.color }"
                  ></span>
                  <span class="truncate">{{ cDist.name }}</span>
                </div>
                <div class="flex justify-between text-gray-500 text-[11px]">
                  <span
                    >Mean Expectancy:
                    <strong class="text-gray-800">{{ cDist.result.meanRr }}R</strong></span
                  >
                  <span
                    >Median:
                    <strong class="text-gray-800">{{ cDist.result.medianRr }}R</strong></span
                  >
                </div>
                <div class="flex justify-between text-gray-500 text-[11px] mt-0.5">
                  <span
                    >Top 3 Profit Share:
                    <strong class="text-indigo-600">{{ cDist.result.top3SharePct }}%</strong></span
                  >
                  <span
                    :class="
                      cDist.result.isConcentratedInFewOutliers
                        ? 'text-amber-600 font-bold'
                        : 'text-emerald-600 font-bold'
                    "
                  >
                    {{
                      cDist.result.isConcentratedInFewOutliers
                        ? '⚠️ Outlier Dependent'
                        : '✅ Steady'
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Note -->
          <div
            class="mt-4 p-3 bg-white rounded-xl border border-gray-200 text-[11px] text-gray-500 leading-relaxed"
          >
            💡 กราฟแท่งเปรียบเทียบความถี่ของผลลัพธ์ในแต่ละระดับ R หากแท่งกำไร (0R ขึ้นไป)
            กระจายกว้างและสม่ำเสมอ แสดงถึง Edge ที่พึ่งพาได้จริง
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 3. FEATURE: Day x Hour Heatmap (ตาราง Heatmap วัน × ชั่วโมง)             -->
    <!-- ========================================================================= -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <i class="ph-bold ph-squares-four text-primary"></i>
            Heatmap วัน × ชั่วโมง (Trading Time Performance)
          </h2>
          <p class="text-xs text-gray-500 mt-0.5">
            ดูว่าเทรดช่วงวันและชั่วโมงไหนได้ผลดีหรือแย่ สลับดูเฉพาะ Setup ที่ต้องการได้
          </p>
        </div>

        <!-- Metric & Setup Switcher -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Setup Tab for Heatmap -->
          <div class="bg-gray-100 p-1 rounded-xl flex text-xs font-bold">
            <button
              type="button"
              @click="heatmapCohortIndex = -1"
              :class="[
                'px-3 py-1.5 rounded-lg transition-colors cursor-pointer',
                heatmapCohortIndex === -1
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              ]"
            >
              All Compared
            </button>
            <button
              v-for="(item, idx) in cohortsWithTrades"
              :key="item.id"
              type="button"
              @click="heatmapCohortIndex = idx"
              :class="[
                'px-3 py-1.5 rounded-lg transition-colors cursor-pointer truncate max-w-[120px]',
                heatmapCohortIndex === idx
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              ]"
              :title="item.name"
            >
              {{ item.name }}
            </button>
          </div>

          <!-- Metric Selector -->
          <div class="bg-gray-100 p-1 rounded-xl flex text-xs font-bold">
            <button
              type="button"
              @click="heatmapMetric = 'netRr'"
              :class="[
                'px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer',
                heatmapMetric === 'netRr'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              ]"
            >
              Net R
            </button>
            <button
              type="button"
              @click="heatmapMetric = 'winRate'"
              :class="[
                'px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer',
                heatmapMetric === 'winRate'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              ]"
            >
              Win Rate %
            </button>
            <button
              type="button"
              @click="heatmapMetric = 'trades'"
              :class="[
                'px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer',
                heatmapMetric === 'trades'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              ]"
            >
              Trades
            </button>
            <button
              type="button"
              @click="heatmapMetric = 'avgRr'"
              :class="[
                'px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer',
                heatmapMetric === 'avgRr'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              ]"
            >
              Expectancy
            </button>
          </div>
        </div>
      </div>

      <!-- Prime & Danger Badges -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div
          class="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center gap-3"
        >
          <div
            class="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg"
          >
            🔥
          </div>
          <div>
            <div class="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Prime Trading Window
            </div>
            <div class="text-sm font-bold text-emerald-900">
              <span v-if="activeHeatmapResult.bestWindow">
                {{ activeHeatmapResult.bestWindow.dayName }} at
                {{ String(activeHeatmapResult.bestWindow.hour).padStart(2, '0') }}:00 (+{{
                  activeHeatmapResult.bestWindow.netRr.toFixed(1)
                }}R across {{ activeHeatmapResult.bestWindow.totalTrades }} trades)
              </span>
              <span v-else>No clear positive window</span>
            </div>
          </div>
        </div>

        <div class="p-4 bg-red-50/70 border border-red-100 rounded-xl flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg"
          >
            ⚠️
          </div>
          <div>
            <div class="text-xs font-bold text-red-800 uppercase tracking-wider">Danger Zone</div>
            <div class="text-sm font-bold text-red-900">
              <span v-if="activeHeatmapResult.worstWindow">
                {{ activeHeatmapResult.worstWindow.dayName }} at
                {{ String(activeHeatmapResult.worstWindow.hour).padStart(2, '0') }}:00 ({{
                  activeHeatmapResult.worstWindow.netRr.toFixed(1)
                }}R across {{ activeHeatmapResult.worstWindow.totalTrades }} trades)
              </span>
              <span v-else>No negative window detected</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Heatmap Grid Table -->
      <div class="overflow-x-auto pb-2">
        <table class="w-full text-center text-xs border-collapse min-w-[760px]">
          <thead>
            <tr>
              <th class="p-1.5 text-left text-gray-400 font-bold uppercase text-[10px] w-14">
                Day
              </th>
              <th v-for="h in 24" :key="h - 1" class="p-1 text-gray-400 font-bold text-[10px]">
                {{ String(h - 1).padStart(2, '0') }}
              </th>
              <th class="p-1.5 text-right text-gray-500 font-bold uppercase text-[10px] w-20">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dayIdx in tradingDayOrder" :key="dayIdx" class="border-t border-gray-100">
              <td class="p-1.5 text-left font-bold text-gray-700 text-xs">
                {{ DAY_NAMES[dayIdx] }}
              </td>
              <td v-for="h in 24" :key="h - 1" class="p-0.5">
                <div
                  :style="getCellStyle(activeHeatmapResult.matrix[dayIdx][h - 1])"
                  :title="getCellTooltip(activeHeatmapResult.matrix[dayIdx][h - 1])"
                  class="h-7 w-full rounded flex items-center justify-center text-[10px] font-bold transition-transform hover:scale-110 cursor-pointer shadow-2xs select-none"
                >
                  {{ getCellDisplayValue(activeHeatmapResult.matrix[dayIdx][h - 1]) }}
                </div>
              </td>
              <td
                class="p-1.5 text-right font-bold text-xs"
                :class="
                  activeHeatmapResult.daySummaries[dayIdx].netRr >= 0
                    ? 'text-emerald-600'
                    : 'text-red-600'
                "
              >
                {{ activeHeatmapResult.daySummaries[dayIdx].netRr >= 0 ? '+' : ''
                }}{{ activeHeatmapResult.daySummaries[dayIdx].netRr.toFixed(1) }}R
                <span class="block text-[10px] text-gray-400 font-normal"
                  >({{ activeHeatmapResult.daySummaries[dayIdx].totalTrades }})</span
                >
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t border-gray-200">
              <td class="p-1.5 text-left font-bold text-gray-500 text-[10px] uppercase">Hour</td>
              <td
                v-for="h in 24"
                :key="h - 1"
                class="p-1 text-[9px] font-bold"
                :class="
                  activeHeatmapResult.hourSummaries[h - 1].netRr >= 0
                    ? 'text-emerald-600'
                    : 'text-red-600'
                "
              >
                {{
                  activeHeatmapResult.hourSummaries[h - 1].totalTrades > 0
                    ? (activeHeatmapResult.hourSummaries[h - 1].netRr >= 0 ? '+' : '') +
                      activeHeatmapResult.hourSummaries[h - 1].netRr.toFixed(0)
                    : '-'
                }}
              </td>
              <td class="p-1.5 text-right font-bold text-gray-900 text-xs">
                {{ activeHeatmapNetR >= 0 ? '+' : '' }}{{ activeHeatmapNetR.toFixed(1) }}R
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 4. FEATURE: MAE / MFE (Scatter Plot เทียบกันบนกราฟเดียว)                   -->
    <!-- ========================================================================= -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <i class="ph-bold ph-chart-scatter text-primary"></i>
            MAE / MFE Analysis (กราฟ Scatter เปรียบเทียบ SL แน่น / TP เร็ว)
          </h2>
          <p class="text-xs text-gray-500 mt-0.5">
            ต่อยอดจาก Potential MFE เป็นกราฟ scatter แสดงไม้ของ Setup ที่คุณเลือกเทียบกัน
            เพื่อดูว่าวาง SL แน่นไปไหม หรือปิด TP เร็วไปไหม
          </p>
        </div>

        <!-- Scatter View Mode Toggle -->
        <div class="bg-gray-100 p-1 rounded-xl flex text-xs font-bold">
          <button
            type="button"
            @click="scatterMode = 'realizedVsMfe'"
            :class="[
              'px-3 py-1.5 rounded-lg transition-colors cursor-pointer',
              scatterMode === 'realizedVsMfe'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            ]"
          >
            Realized RR vs MFE (ปิด TP เร็วไหม)
          </button>
          <button
            type="button"
            @click="scatterMode = 'maeVsMfe'"
            :class="[
              'px-3 py-1.5 rounded-lg transition-colors cursor-pointer',
              scatterMode === 'maeVsMfe'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            ]"
          >
            MAE vs MFE (วาง SL แน่นไหม)
          </button>
        </div>
      </div>

      <!-- Excursion Metrics Comparison Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div
          v-for="cItem in cohortMaeMfeResults"
          :key="cItem.cohortId"
          class="p-4 rounded-xl border bg-gray-50/70"
          :style="{ borderColor: cItem.color + '40' }"
        >
          <div
            class="flex items-center gap-2 mb-2 font-bold text-xs"
            :style="{ color: cItem.color }"
          >
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: cItem.color }"></span>
            <span class="truncate">{{ cItem.name }}</span>
          </div>
          <div class="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span class="text-[10px] text-gray-400 block uppercase">Efficiency</span>
              <strong class="text-indigo-600">{{ cItem.result.avgCaptureEfficiencyPct }}%</strong>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 block uppercase">Left on Table</span>
              <strong class="text-amber-600">+{{ cItem.result.totalLeftOnTableRr }}R</strong>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 block uppercase">Reversal Losses</span>
              <strong class="text-red-600">{{ cItem.result.reversalLossesCount }} ไม้</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Scatter Chart -->
      <div class="h-80 w-full mb-4">
        <Scatter :data="scatterChartData" :options="scatterChartOptions" />
      </div>

      <!-- Actionable Advice Box -->
      <div
        class="p-4 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed flex items-start gap-3"
      >
        <i class="ph-bold ph-info text-blue-600 text-lg flex-shrink-0 mt-0.5"></i>
        <div>
          <div class="font-bold text-blue-950 mb-1">
            คำแนะนำการปรับปรุง Edge จากข้อมูล MAE / MFE:
          </div>
          <p class="leading-relaxed">
            จุดบนกราฟ Scatter แยกสีตาม Setup ที่คุณเลือก: จุดที่อยู่ห่างขึ้นไปข้างบนจากเส้นประ $Y =
            X$ แสดงว่าราคาวิ่งต่อไปไกลหลังปิด TP (ปิดเร็วเกินไป) และจุดทางซ้ายแดนลบ ($X < 0$) ที่มี
            $Y \ge 1R$ คือไม้ที่เคยบวกแต่ปล่อยให้กลับมาแพ้ ซึ่งสามารถแก้ไขได้โดยการตั้งกฎเลื่อน
            Break Even
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BaseSelect from '../ui/BaseSelect.vue'
import { filterTrades, createDefaultFilters, TradeFiltersState } from '../../utils/tradeFilters'
import { TradeRecord, StatMode } from '../../utils/statistics'
import {
  calculateCohortsPerformance,
  calculateRDistribution,
  calculateDayHourHeatmap,
  calculateMaeMfeScatter,
  DAY_NAMES,
  HeatmapCell,
  RDistributionResult
} from '../../utils/edgeAnalysis'
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
import { Bar, Scatter } from 'vue-chartjs'

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

const COHORT_PALETTE = [
  {
    bg: '#4f46e5',
    border: '#4338ca',
    light: '#eef2ff',
    text: '#3730a3',
    badgeBg: 'bg-indigo-50 border-indigo-200',
    badgeText: 'text-indigo-700'
  },
  {
    bg: '#059669',
    border: '#047857',
    light: '#ecfdf5',
    text: '#065f46',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-700'
  },
  {
    bg: '#d97706',
    border: '#b45309',
    light: '#fffbeb',
    text: '#92400e',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-700'
  },
  {
    bg: '#7c3aed',
    border: '#6d28d9',
    light: '#f5f3ff',
    text: '#5b21b6',
    badgeBg: 'bg-purple-50 border-purple-200',
    badgeText: 'text-purple-700'
  },
  {
    bg: '#e11d48',
    border: '#be123c',
    light: '#fff1f2',
    text: '#9f1239',
    badgeBg: 'bg-rose-50 border-rose-200',
    badgeText: 'text-rose-700'
  },
  {
    bg: '#0891b2',
    border: '#0e7490',
    light: '#ecfeff',
    text: '#155e75',
    badgeBg: 'bg-cyan-50 border-cyan-200',
    badgeText: 'text-cyan-700'
  }
]

export interface ComparisonCohort {
  id: string
  name: string
  color: (typeof COHORT_PALETTE)[0]
  filters: TradeFiltersState
  customColumns: any[]
}

// State
const statMode = ref<StatMode>('normal')
const setups = ref<any[]>([])
const symbols = ref<any[]>([])
const allTrades = ref<TradeRecord[]>([])

const cohorts = ref<ComparisonCohort[]>([])

const setupSortKey = ref<'avgRr' | 'winRate' | 'profitFactor' | 'totalTrades' | 'totalRr'>('avgRr')
const heatmapMetric = ref<'netRr' | 'winRate' | 'trades' | 'avgRr'>('netRr')
const heatmapCohortIndex = ref<number>(-1) // -1 = All combined
const scatterMode = ref<'realizedVsMfe' | 'maeVsMfe'>('realizedVsMfe')

const tradingDayOrder = [1, 2, 3, 4, 5, 0, 6] // Mon - Sun

const availableSessions = [
  { label: 'All Sessions', value: 'all' },
  { label: 'London', value: 'London' },
  { label: 'New York', value: 'New York' },
  { label: 'London Close', value: 'London Close' },
  { label: 'Asia', value: 'Asia' },
  { label: 'Tokyo', value: 'Tokyo' }
]

// Cohort Management
const addCohort = async () => {
  const nextColor = COHORT_PALETTE[cohorts.value.length % COHORT_PALETTE.length]
  const usedSetupIds = new Set(cohorts.value.map((c) => String(c.filters.setup)))
  const nextSetup = setups.value.find((s) => !usedSetupIds.has(String(s.id))) || setups.value[0]

  const newCohort: ComparisonCohort = {
    id: `cohort-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: nextSetup ? nextSetup.name : `Setup #${cohorts.value.length + 1}`,
    color: nextColor,
    filters: createDefaultFilters(),
    customColumns: []
  }

  if (nextSetup) {
    newCohort.filters.setup = nextSetup.id
    try {
      const res = await window.api?.customColumns?.list(Number(nextSetup.id))
      if (res?.success) {
        newCohort.customColumns = res.data.filter((c: any) => c.reportFilter)
      }
    } catch {}
  }

  cohorts.value.push(newCohort)
}

const removeCohort = (idx: number) => {
  if (cohorts.value.length > 1) {
    cohorts.value.splice(idx, 1)
  }
}

const resetCohortFilters = (cohort: ComparisonCohort) => {
  const currentSetup = cohort.filters.setup
  cohort.filters = createDefaultFilters()
  cohort.filters.setup = currentSetup
}

const onCohortSetupChange = async (cohort: ComparisonCohort) => {
  if (cohort.filters.setup && cohort.filters.setup !== 'all') {
    const s = setups.value.find((st) => String(st.id) === String(cohort.filters.setup))
    if (s) cohort.name = s.name
    try {
      const res = await window.api?.customColumns?.list(Number(cohort.filters.setup))
      if (res?.success) {
        cohort.customColumns = res.data.filter((c: any) => c.reportFilter)
      } else {
        cohort.customColumns = []
      }
    } catch {
      cohort.customColumns = []
    }
  } else {
    cohort.name = 'All Setups'
    cohort.customColumns = []
  }
}

// Data loading
const loadData = async () => {
  try {
    const [setupsRes, symbolsRes, tradesRes] = await Promise.all([
      window.api?.setups?.list() ?? { success: true, data: [] },
      window.api?.symbols?.list() ?? { success: true, data: [] },
      window.api?.journal?.list() ?? { success: true, data: [] }
    ])

    if (setupsRes.success) setups.value = setupsRes.data
    if (symbolsRes.success) symbols.value = symbolsRes.data
    if (tradesRes.success) allTrades.value = tradesRes.data

    // Initialize default cohorts: Setup 1 vs Setup 2 (2 cohorts by default)
    if (cohorts.value.length === 0) {
      const setupA = setups.value[0]
      const setupB = setups.value[1] || setups.value[0]

      const c1: ComparisonCohort = {
        id: 'cohort-1',
        name: setupA ? setupA.name : 'Setup #1',
        color: COHORT_PALETTE[0],
        filters: createDefaultFilters(),
        customColumns: []
      }
      if (setupA) {
        c1.filters.setup = setupA.id
        try {
          const res = await window.api?.customColumns?.list(Number(setupA.id))
          if (res?.success) c1.customColumns = res.data.filter((c: any) => c.reportFilter)
        } catch {}
      }

      const c2: ComparisonCohort = {
        id: 'cohort-2',
        name: setupB ? setupB.name : 'Setup #2',
        color: COHORT_PALETTE[1],
        filters: createDefaultFilters(),
        customColumns: []
      }
      if (setupB) {
        c2.filters.setup = setupB.id
        try {
          const res = await window.api?.customColumns?.list(Number(setupB.id))
          if (res?.success) c2.customColumns = res.data.filter((c: any) => c.reportFilter)
        } catch {}
      }

      cohorts.value = [c1, c2]
    }
  } catch (err) {
    console.error('Failed to load edge analysis data:', err)
  }
}

onMounted(() => {
  loadData()
})

// Cohorts with filtered trades
const cohortsWithTrades = computed(() => {
  return cohorts.value.map((cohort, index) => {
    const cTrades = filterTrades(allTrades.value, cohort.filters, cohort.customColumns)
    const setupName =
      setups.value.find((s) => String(s.id) === String(cohort.filters.setup))?.name ||
      (cohort.filters.setup === 'all' ? 'All Setups' : `Setup #${cohort.filters.setup}`)

    const parts: string[] = []
    if (cohort.filters.symbol !== 'all') parts.push(`Symbol: ${cohort.filters.symbol}`)
    if (cohort.filters.session !== 'all') parts.push(`Session: ${cohort.filters.session}`)
    if (cohort.filters.startDate) parts.push(`From: ${cohort.filters.startDate}`)
    if (cohort.filters.endDate) parts.push(`To: ${cohort.filters.endDate}`)
    if (cohort.filters.includePaperTrades) parts.push(`Paper Included`)

    const customEntries = Object.entries(cohort.filters.customFields || {}).filter(
      ([_, v]) => v !== undefined && v !== '' && v !== 'all'
    )
    if (customEntries.length > 0) parts.push(`Custom: ${customEntries.length} filters`)

    return {
      id: cohort.id,
      index,
      name: setupName,
      color: cohort.color.bg,
      colorObj: cohort.color,
      cohort,
      filterSummary: parts.join(' • ') || 'No extra filters',
      trades: cTrades
    }
  })
})

// 1. Performance by Setup (Cohort comparison)
const cohortPerformance = computed(() => {
  const inputs = cohortsWithTrades.value.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
    filterSummary: c.filterSummary,
    trades: c.trades
  }))
  return calculateCohortsPerformance(inputs, statMode.value)
})

const sortedCohortItems = computed(() => {
  const items = [...cohortPerformance.value.items]
  items.sort((a, b) => {
    const valA = (a as any)[setupSortKey.value] ?? 0
    const valB = (b as any)[setupSortKey.value] ?? 0
    return Number(valB) - Number(valA)
  })
  return items
})

// 2. R-Multiple Distribution
const cohortDistributions = computed(() => {
  return cohortsWithTrades.value.map((c) => ({
    cohortId: c.id,
    name: c.name,
    color: c.color,
    result: calculateRDistribution(c.trades, statMode.value) as RDistributionResult
  }))
})

const rDistributionChartData = computed(() => {
  if (cohortDistributions.value.length === 0) {
    return { labels: [], datasets: [] }
  }

  const labels = cohortDistributions.value[0].result.bins.map((b) => b.label)
  const datasets = cohortDistributions.value.map((c) => ({
    label: c.name,
    data: c.result.bins.map((b) => b.count),
    backgroundColor: c.color,
    borderRadius: 5,
    barPercentage: 0.8,
    categoryPercentage: 0.8
  }))

  return { labels, datasets }
})

const rDistributionChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: { font: { size: 11, weight: 'bold' } }
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const dsLabel = context.dataset.label || ''
          return `${dsLabel}: ${context.parsed.y} trades`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { precision: 0 }
    }
  }
}

// 3. Day x Hour Heatmap
const activeHeatmapTrades = computed(() => {
  if (heatmapCohortIndex.value === -1) {
    // All compared trades combined (unique by trade ID)
    const set = new Map<any, TradeRecord>()
    cohortsWithTrades.value.forEach((c) => {
      c.trades.forEach((t) => {
        if (t.id) set.set(t.id, t)
      })
    })
    return Array.from(set.values())
  }
  const chosen = cohortsWithTrades.value[heatmapCohortIndex.value]
  return chosen ? chosen.trades : []
})

const activeHeatmapResult = computed(() => {
  return calculateDayHourHeatmap(activeHeatmapTrades.value, statMode.value)
})

const activeHeatmapNetR = computed(() => {
  return activeHeatmapTrades.value.reduce((acc, t) => {
    const r =
      statMode.value === 'normal'
        ? (t.normalRr ?? 0)
        : statMode.value === 'be'
          ? (t.beRr ?? t.normalRr ?? 0)
          : (t.trailRr ?? t.normalRr ?? 0)
    return acc + Number(r)
  }, 0)
})

const getCellDisplayValue = (cell: HeatmapCell) => {
  if (cell.totalTrades === 0) return ''
  if (heatmapMetric.value === 'netRr')
    return `${cell.netRr >= 0 ? '+' : ''}${cell.netRr.toFixed(0)}`
  if (heatmapMetric.value === 'winRate') return `${cell.winRate?.toFixed(0)}%`
  if (heatmapMetric.value === 'trades') return `${cell.totalTrades}`
  if (heatmapMetric.value === 'avgRr')
    return `${cell.avgRr && cell.avgRr >= 0 ? '+' : ''}${cell.avgRr?.toFixed(1)}`
  return ''
}

const getCellStyle = (cell: HeatmapCell) => {
  if (cell.totalTrades === 0) {
    return { backgroundColor: '#f8fafc', color: '#cbd5e1' }
  }

  if (heatmapMetric.value === 'netRr' || heatmapMetric.value === 'avgRr') {
    const val = heatmapMetric.value === 'netRr' ? cell.netRr : (cell.avgRr ?? 0)
    if (val > 0) {
      const alpha = Math.min(0.9, Math.max(0.15, val / 4))
      return {
        backgroundColor: `rgba(16, 185, 129, ${alpha})`,
        color: alpha > 0.45 ? '#ffffff' : '#065f46'
      }
    } else if (val < 0) {
      const alpha = Math.min(0.9, Math.max(0.15, Math.abs(val) / 3))
      return {
        backgroundColor: `rgba(239, 68, 68, ${alpha})`,
        color: alpha > 0.45 ? '#ffffff' : '#991b1b'
      }
    }
    return { backgroundColor: '#f1f5f9', color: '#64748b' }
  }

  if (heatmapMetric.value === 'winRate') {
    const wr = cell.winRate ?? 0
    if (wr >= 60) return { backgroundColor: 'rgba(16, 185, 129, 0.75)', color: '#ffffff' }
    if (wr >= 40) return { backgroundColor: 'rgba(245, 158, 11, 0.7)', color: '#ffffff' }
    return { backgroundColor: 'rgba(239, 68, 68, 0.7)', color: '#ffffff' }
  }

  const alpha = Math.min(0.9, Math.max(0.2, cell.totalTrades / 5))
  return {
    backgroundColor: `rgba(99, 102, 241, ${alpha})`,
    color: alpha > 0.45 ? '#ffffff' : '#312e81'
  }
}

const getCellTooltip = (cell: HeatmapCell) => {
  if (cell.totalTrades === 0)
    return `${cell.dayName} ${String(cell.hour).padStart(2, '0')}:00 - No trades`
  return `${cell.dayName} ${String(cell.hour).padStart(2, '0')}:00\nTrades: ${cell.totalTrades} (${cell.wins}W / ${cell.losses}L / ${cell.breakEvens}BE)\nWin Rate: ${cell.winRate}%\nNet R: ${cell.netRr >= 0 ? '+' : ''}${cell.netRr}R\nExpectancy: ${cell.avgRr}R`
}

// 4. MAE / MFE Scatter Plot
const cohortMaeMfeResults = computed(() => {
  return cohortsWithTrades.value.map((c) => ({
    cohortId: c.id,
    name: c.name,
    color: c.color,
    result: calculateMaeMfeScatter(c.trades, statMode.value)
  }))
})

const scatterChartData = computed(() => {
  const isRealized = scatterMode.value === 'realizedVsMfe'
  const datasets: any[] = []

  let maxObserved = 5
  cohortMaeMfeResults.value.forEach((c) => {
    if (c.result.maxObservedMfe > maxObserved) maxObserved = c.result.maxObservedMfe
  })

  // Add dataset per cohort
  cohortMaeMfeResults.value.forEach((c) => {
    const points = c.result.points.map((p) => ({
      x: isRealized ? p.realizedRr : p.mae,
      y: p.maxRr,
      raw: p,
      cohortName: c.name
    }))

    datasets.push({
      label: c.name,
      data: points,
      backgroundColor: c.color,
      pointRadius: 6,
      pointHoverRadius: 8
    })
  })

  // Reference diagonal line (Y = X) for realized mode
  if (isRealized) {
    const minVal = -2
    const maxVal = Math.max(6, maxObserved + 1)
    datasets.push({
      label: '100% Exit Efficiency (Peak Y = X)',
      data: [
        { x: minVal, y: minVal },
        { x: maxVal, y: maxVal }
      ],
      showLine: true,
      borderColor: 'rgba(156, 163, 175, 0.6)',
      borderDash: [5, 5],
      pointRadius: 0,
      fill: false
    })
  }

  return { datasets } as any
})

const scatterChartOptions = computed<ChartOptions<'scatter'>>(() => {
  const isRealized = scatterMode.value === 'realizedVsMfe'
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { font: { size: 11, weight: 'bold' } }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const raw = context.raw?.raw
            const cohortName = context.raw?.cohortName || ''
            if (!raw) return ''
            if (isRealized) {
              return [
                `[${cohortName}] ${raw.symbolName} (${raw.setupName})`,
                `Realized RR: ${raw.realizedRr >= 0 ? '+' : ''}${raw.realizedRr}R`,
                `Potential MFE: +${raw.maxRr}R`,
                raw.leftOnTableRr > 0 ? `Left on table: ${raw.leftOnTableRr}R` : '',
                raw.isReversalLoss ? '⚠️ Reversal Loss: Reached >= 1R then hit SL!' : ''
              ].filter(Boolean)
            } else {
              return [
                `[${cohortName}] ${raw.symbolName} (${raw.setupName})`,
                `MAE (Drawdown): ${raw.mae}R`,
                `MFE (Peak): +${raw.maxRr}R`,
                `Result: ${raw.realizedRr >= 0 ? '+' : ''}${raw.realizedRr}R`
              ]
            }
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: isRealized
            ? 'Realized RR (ผลลัพธ์ R ที่ได้จริง)'
            : 'MAE (Maximum Adverse Excursion in R)',
          font: { weight: 'bold', size: 12 }
        },
        grid: { color: 'rgba(243, 244, 246, 1)' }
      },
      y: {
        title: {
          display: true,
          text: 'Potential MFE / Max RR (จุดที่ราคาวิ่งไปไกลสุด)',
          font: { weight: 'bold', size: 12 }
        },
        beginAtZero: true,
        grid: { color: 'rgba(243, 244, 246, 1)' }
      }
    }
  }
})
</script>
