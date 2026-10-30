<template>
  <div class="flex flex-col gap-6">
    <!-- Top Row: Best Zone Recommendation Badges -->
    <div v-if="metrics.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Badge 1: Best EV -->
      <div class="p-4 rounded-2xl border bg-emerald-50/50 border-emerald-200 flex items-center gap-3.5 shadow-2xs">
        <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shrink-0">
          <i class="ph ph-trophy"></i>
        </div>
        <div class="min-w-0">
          <div class="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Most Profitable (Best EV)</div>
          <div class="font-extrabold text-sm text-gray-900 truncate">
            {{ getZoneNameById(bestEvZoneId) || 'N/A' }}
          </div>
          <div class="text-[11px] font-semibold text-emerald-700 mt-0.5">
            EV: +{{ getMetricById(bestEvZoneId)?.expectedValue ?? 0 }}R ต่อไม้
          </div>
        </div>
      </div>

      <!-- Badge 2: Highest Win Rate -->
      <div class="p-4 rounded-2xl border bg-blue-50/50 border-blue-200 flex items-center gap-3.5 shadow-2xs">
        <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl shrink-0">
          <i class="ph ph-target"></i>
        </div>
        <div class="min-w-0">
          <div class="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Highest Win Rate</div>
          <div class="font-extrabold text-sm text-gray-900 truncate">
            {{ getZoneNameById(highestWinRateZoneId) || 'N/A' }}
          </div>
          <div class="text-[11px] font-semibold text-blue-700 mt-0.5">
            Win Rate: {{ getMetricById(highestWinRateZoneId)?.winRate ?? 0 }}%
          </div>
        </div>
      </div>

      <!-- Badge 3: Lowest Miss Rate -->
      <div class="p-4 rounded-2xl border bg-amber-50/50 border-amber-200 flex items-center gap-3.5 shadow-2xs">
        <div class="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center text-xl shrink-0">
          <i class="ph ph-train"></i>
        </div>
        <div class="min-w-0">
          <div class="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Lowest Miss Rate (ตกรถน้อยสุด)</div>
          <div class="font-extrabold text-sm text-gray-900 truncate">
            {{ getZoneNameById(lowestMissRateZoneId) || 'N/A' }}
          </div>
          <div class="text-[11px] font-semibold text-amber-700 mt-0.5">
            ตกรถเพียง: {{ getMetricById(lowestMissRateZoneId)?.missRate ?? 0 }}%
          </div>
        </div>
      </div>

      <!-- Badge 4: Highest Max RR -->
      <div class="p-4 rounded-2xl border bg-purple-50/50 border-purple-200 flex items-center gap-3.5 shadow-2xs">
        <div class="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xl shrink-0">
          <i class="ph ph-rocket-launch"></i>
        </div>
        <div class="min-w-0">
          <div class="text-[11px] font-bold text-purple-800 uppercase tracking-wider">Highest RR Potential</div>
          <div class="font-extrabold text-sm text-gray-900 truncate">
            {{ getZoneNameById(highestMaxRrZoneId) || 'N/A' }}
          </div>
          <div class="text-[11px] font-semibold text-purple-700 mt-0.5">
            Max RR เฉลี่ย: {{ getMetricById(highestMaxRrZoneId)?.avgMaxRr ?? 0 }}R
          </div>
        </div>
      </div>
    </div>

    <!-- Main Comparison Table Card -->
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
      <div class="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <i class="ph ph-table text-primary text-lg"></i>
            Zone Performance Comparison Matrix
          </h3>
          <p class="text-xs text-gray-500 mt-0.5">
            ตารางเปรียบเทียบสถิติอัตราได้ของ, วินเรท (คิดเฉพาะไม้ที่ได้ของ), ผลตอบแทนเฉลี่ย และความคุ้มค่า (Expected Value)
          </p>
        </div>

        <span class="text-xs font-semibold text-gray-400">
          {{ metrics.length }} โซนในการวิจัย
        </span>
      </div>

      <div v-if="metrics.length === 0" class="text-center py-16 text-gray-400 text-sm">
        <i class="ph ph-chart-bar text-4xl mb-2 inline-block text-gray-300"></i>
        <p>ยังไม่มีข้อมูลสถิติของโซนตามตัวกรองที่เลือก</p>
        <p class="text-xs text-gray-400 mt-1">เริ่มบันทึกสถิติในหน้า "จดสถิติ" เพื่อดูผลการวิจัย</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
              <th class="py-3.5 px-4">Zone / Parameter</th>
              <th class="py-3.5 px-3 text-center">Samples</th>
              <th class="py-3.5 px-4 min-w-[140px]">Fill Rate vs Miss Rate</th>
              <th class="py-3.5 px-3 text-center">Win Rate (Filled)</th>
              <th class="py-3.5 px-3 text-center">W / L / BE</th>
              <th class="py-3.5 px-3 text-center">Avg Min RR</th>
              <th class="py-3.5 px-3 text-center">Avg Max RR</th>
              <th class="py-3.5 px-3 text-center">Avg SL</th>
              <th class="py-3.5 px-4 text-right">Expected Value (EV)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 font-medium text-gray-800">
            <tr
              v-for="m in metrics"
              :key="m.customColumnId"
              class="hover:bg-gray-50/60 transition-colors"
            >
              <!-- Zone Name & Badges -->
              <td class="py-3.5 px-4">
                <div class="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  {{ m.columnName }}
                  <span
                    v-if="m.customColumnId === bestEvZoneId"
                    class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800"
                    title="Best Expected Value"
                  >
                    🏆 Best EV
                  </span>
                  <span
                    v-if="m.customColumnId === highestWinRateZoneId && m.customColumnId !== bestEvZoneId"
                    class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800"
                    title="Highest Win Rate"
                  >
                    🎯 High WR
                  </span>
                </div>
              </td>

              <!-- Total Samples -->
              <td class="py-3.5 px-3 text-center font-bold text-gray-700">
                {{ m.totalSamples }}
              </td>

              <!-- Fill Rate vs Miss Rate Progress Bar -->
              <td class="py-3.5 px-4">
                <div class="flex items-center justify-between text-[11px] mb-1">
                  <span class="font-bold text-emerald-700">{{ m.fillRate }}% ได้ของ</span>
                  <span class="font-bold text-amber-700">{{ m.missRate }}% ตกรถ</span>
                </div>
                <div class="w-full h-2 rounded-full bg-amber-200 overflow-hidden flex">
                  <div class="h-full bg-emerald-500" :style="{ width: `${m.fillRate}%` }"></div>
                  <div class="h-full bg-amber-400" :style="{ width: `${m.missRate}%` }"></div>
                </div>
              </td>

              <!-- Win Rate (Filled Trades) -->
              <td class="py-3.5 px-3 text-center">
                <span
                  class="px-2.5 py-1 rounded-lg text-xs font-bold"
                  :class="
                    m.winRate >= 60
                      ? 'bg-emerald-100 text-emerald-800'
                      : m.winRate >= 45
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  "
                >
                  {{ m.winRate }}%
                </span>
              </td>

              <!-- Breakdown W / L / BE -->
              <td class="py-3.5 px-3 text-center font-mono text-xs">
                <span class="text-emerald-600 font-bold">{{ m.winCount }}</span> /
                <span class="text-red-500 font-bold">{{ m.lossCount }}</span> /
                <span class="text-gray-500">{{ m.beCount }}</span>
              </td>

              <!-- Avg Min RR -->
              <td class="py-3.5 px-3 text-center font-bold text-gray-900">
                {{ m.avgMinRr }}R
              </td>

              <!-- Avg Max RR -->
              <td class="py-3.5 px-3 text-center font-bold text-purple-700">
                {{ m.avgMaxRr }}R
              </td>

              <!-- Avg SL Points -->
              <td class="py-3.5 px-3 text-center text-gray-600 font-mono">
                <div v-if="m.avgSlPoints > 0">{{ m.avgSlPoints }} pts</div>
                <div
                  v-if="m.avgRealSlPoints && m.avgRealSlPoints > 0"
                  class="text-[10px] text-amber-600 font-sans font-bold"
                  title="Average Real Drawdown (MAE) ของไม้ที่มีการกรอก"
                >
                  Real: {{ m.avgRealSlPoints }} pts
                </div>
                <span v-else-if="!m.avgSlPoints">-</span>
              </td>

              <!-- Expected Value (EV) -->
              <td class="py-3.5 px-4 text-right">
                <span
                  class="px-2.5 py-1 rounded-lg font-mono font-bold text-xs"
                  :class="
                    m.expectedValue > 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : m.expectedValue < 0
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-gray-100 text-gray-700'
                  "
                >
                  {{ m.expectedValue > 0 ? `+${m.expectedValue}` : m.expectedValue }}R
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Explanatory Footer -->
      <div class="p-4 bg-gray-50/70 border-t border-gray-100 text-[11px] text-gray-500 flex flex-col sm:flex-row justify-between gap-2">
        <div>
          <span class="font-bold text-gray-700">สูตรคำนวณ Expected Value (EV):</span>
          <code class="ml-1 px-1.5 py-0.5 rounded bg-gray-200/70 text-gray-800 font-mono text-[10px]">
            (Win Rate × Avg Win RR) - (Loss Rate × 1)
          </code>
        </div>
        <div>
          * วินเรทคำนวณจากเฉพาะไม้ที่ได้ของ (Filled Trades เท่านั้น) ไม้ตกรถไม่นำมาหักลบวินเรท
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ZoneComparisonMetric } from '../../../../../shared/types'

const props = defineProps<{
  metrics: ZoneComparisonMetric[]
  bestEvZoneId?: number | null
  highestWinRateZoneId?: number | null
  lowestMissRateZoneId?: number | null
  highestMaxRrZoneId?: number | null
}>()

const getMetricById = (id?: number | null) => {
  if (!id) return null
  return props.metrics.find((m) => m.customColumnId === id) || null
}

const getZoneNameById = (id?: number | null) => {
  return getMetricById(id)?.columnName || null
}
</script>
