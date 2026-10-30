<template>
  <div class="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-8">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-primary/10 text-primary uppercase tracking-wider">
            Trade Research & Analytics
          </span>
          <span class="text-xs text-gray-400 font-semibold">
            {{ totalEntriesCount }} บันทึกการวิจัย
          </span>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          สรุปผลวิจัยและเปรียบเทียบโซน
        </h1>
        <p class="text-gray-500 text-sm mt-1">
          ตารางเปรียบเทียบ Fill Rate, Win Rate, Risk:Reward, และ Expected Value ของแต่ละโซนใน Setup
        </p>
      </div>

      <!-- Quick Actions -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          @click="loadDashboardData"
          class="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-2xs cursor-pointer"
          title="รีเฟรชข้อมูล"
        >
          <i class="ph ph-arrow-clockwise text-base" :class="{ 'animate-spin': loading }"></i>
        </button>

        <!-- Export Dropdown -->
        <div class="relative">
          <button
            type="button"
            @click="isExportMenuOpen = !isExportMenuOpen"
            data-testid="research-export-dropdown-btn"
            class="px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <i class="ph ph-export text-base text-primary"></i>
            <span>ส่งออกข้อมูล (Export)</span>
            <i class="ph ph-caret-down text-xs text-gray-400"></i>
          </button>

          <!-- Export Dropdown Menu -->
          <div
            v-if="isExportMenuOpen"
            class="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
          >
            <div class="px-3.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              AI Deep Analysis
            </div>
            <button
              type="button"
              @click="handleExportAi('md')"
              data-testid="export-ai-md-btn"
              class="w-full px-3.5 py-2 text-left text-xs text-gray-700 hover:bg-primary/5 hover:text-primary flex items-start gap-2.5 cursor-pointer transition-colors"
            >
              <i class="ph ph-file-text text-lg text-purple-600 mt-0.5"></i>
              <div>
                <div class="font-bold">Export AI Markdown (.md)</div>
                <div class="text-[10px] text-gray-400">บันทึกไฟล์ .md พร้อม Prompt ให้ AI วิเคราะห์</div>
              </div>
            </button>
            <button
              type="button"
              @click="handleCopyAiPrompt"
              data-testid="copy-ai-prompt-btn"
              class="w-full px-3.5 py-2 text-left text-xs text-gray-700 hover:bg-primary/5 hover:text-primary flex items-start gap-2.5 cursor-pointer transition-colors"
            >
              <i class="ph ph-copy text-lg text-indigo-600 mt-0.5"></i>
              <div>
                <div class="font-bold">คัดลอก AI Prompt (.md)</div>
                <div class="text-[10px] text-gray-400">ก๊อปปี้ลงคลิปบอร์ดเพื่อนำไปวางใน ChatGPT/Claude</div>
              </div>
            </button>

            <div class="my-1.5 border-t border-gray-100"></div>
            <div class="px-3.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Spreadsheets & Data
            </div>
            <button
              type="button"
              @click="handleExportExcel"
              data-testid="export-excel-btn"
              class="w-full px-3.5 py-2 text-left text-xs text-gray-700 hover:bg-primary/5 hover:text-primary flex items-start gap-2.5 cursor-pointer transition-colors"
            >
              <i class="ph ph-file-xls text-lg text-emerald-600 mt-0.5"></i>
              <div>
                <div class="font-bold">Export to Excel (.xlsx)</div>
                <div class="text-[10px] text-gray-400">รายงานสรุปโซนและรายการเทรด 2 แผ่นงาน</div>
              </div>
            </button>
          </div>
        </div>

        <router-link
          to="/research/settings"
          class="px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <i class="ph ph-gear text-base"></i>
          <span>ตั้งค่าการวิจัย</span>
        </router-link>

        <router-link
          to="/research/entry"
          class="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <i class="ph ph-plus-circle text-base"></i>
          <span>จดสถิติไม้ใหม่</span>
        </router-link>
      </div>
    </div>

    <!-- Export Toast Notification -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="exportToast.show"
        data-testid="research-export-toast"
        :class="[
          'p-4 rounded-xl border flex items-center justify-between text-xs font-bold shadow-md',
          exportToast.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        ]"
      >
        <div class="flex items-center gap-2">
          <i
            class="text-base"
            :class="exportToast.type === 'success' ? 'ph ph-check-circle text-emerald-600' : 'ph ph-warning-circle text-red-600'"
          ></i>
          <span>{{ exportToast.message }}</span>
        </div>
        <button @click="exportToast.show = false" class="text-gray-400 hover:text-gray-600">
          <i class="ph ph-x text-sm"></i>
        </button>
      </div>
    </Transition>

    <!-- Filter Bar Component -->
    <ResearchFilterBar
      v-model="filters"
      :setups="setups"
      :symbols="symbols"
      @change="onFilterChange"
    />

    <!-- Loading Spinner -->
    <div v-if="loading && !analyticsData" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
      <p class="text-xs font-semibold text-gray-400">กำลังประมวลผลข้อมูลวิจัย...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!loading && (!analyticsData || analyticsData.zoneMetrics.length === 0)"
      class="bg-white rounded-3xl p-12 border border-gray-200/80 shadow-2xs text-center flex flex-col items-center justify-center py-20"
    >
      <div class="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl mb-4">
        <i class="ph ph-chart-line-up"></i>
      </div>
      <h3 class="text-lg font-bold text-gray-800 mb-1">ยังไม่มีข้อมูลสถิติการวิจัย</h3>
      <p class="text-sm text-gray-500 max-w-md mb-6">
        เริ่มต้นบันทึกไม้การเทรดแรกของคุณในระบบวิจัย เพื่อวิเคราะห์ว่าโซนเข้าไหนให้ Win Rate และ Expected Value สูงที่สุด
      </p>
      <router-link
        to="/research/entry"
        class="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-colors shadow-sm inline-flex items-center gap-2"
      >
        <i class="ph ph-plus-circle text-lg"></i>
        <span>เริ่มจดสถิติไม้แรก</span>
      </router-link>
    </div>

    <!-- Analytics Content -->
    <div v-else-if="analyticsData" class="space-y-8">
      <!-- 1. Zone Comparison Table + Badges -->
      <ZoneComparisonTable
        :metrics="analyticsData.zoneMetrics"
        :best-ev-zone-id="analyticsData.bestEvZoneId"
        :highest-win-rate-zone-id="analyticsData.highestWinRateZoneId"
        :lowest-miss-rate-zone-id="analyticsData.lowestMissRateZoneId"
        :highest-max-rr-zone-id="analyticsData.highestMaxRrZoneId"
      />

      <!-- 2. Charts (Outcomes Distribution + EV vs Max RR) -->
      <ZonePerformanceChart :metrics="analyticsData.zoneMetrics" />
    </div>

    <!-- 3. Recent Research Entries History Table -->
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
      <!-- Table Header & Search -->
      <div class="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <i class="ph ph-clock-counter-clockwise text-primary text-lg"></i>
            ประวัติการจดสถิติ (Research Entries Log)
          </h3>
          <p class="text-xs text-gray-500 mt-0.5">
            รายการบันทึกผลการเทรดทั้งหมดตามตัวกรองที่เลือก
          </p>
        </div>

        <!-- Search Bar -->
        <div class="relative w-full sm:w-64">
          <i class="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหา Symbol, Setup, โน้ต..."
            class="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <!-- Table Body -->
      <div v-if="paginatedEntries.length === 0" class="text-center py-16 text-gray-400 text-xs">
        <i class="ph ph-folder-open text-3xl mb-2 inline-block text-gray-300"></i>
        <p>ไม่พบรายการวิจัยที่ตรงกับคำค้นหาหรือตัวกรอง</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
              <th class="py-3.5 px-4">วันที่/เวลาเข้า</th>
              <th class="py-3.5 px-3">Symbol</th>
              <th class="py-3.5 px-3">Setup & Session</th>
              <th class="py-3.5 px-3 text-center">TF</th>
              <th class="py-3.5 px-3 text-center">Quality / News</th>
              <th class="py-3.5 px-4 min-w-[200px]">ผลลัพธ์แยกตามโซน</th>
              <th class="py-3.5 px-3 text-center">รูปภาพ</th>
              <th class="py-3.5 px-4 text-right">การกระทำ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 font-medium text-gray-800">
            <tr
              v-for="entry in paginatedEntries"
              :key="entry.id"
              class="hover:bg-gray-50/60 transition-colors"
            >
              <!-- Datetime -->
              <td class="py-3.5 px-4">
                <div class="font-bold text-gray-900">
                  {{ formatDate(entry.entryDatetime) }}
                </div>
                <div class="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                  <i class="ph ph-clock"></i>
                  {{ formatTime(entry.entryDatetime) }}
                  <span v-if="entry.exitDatetime" class="text-gray-300">→</span>
                  <span v-if="entry.exitDatetime" class="text-gray-500">
                    {{ formatTime(entry.exitDatetime) }}
                  </span>
                </div>
              </td>

              <!-- Symbol -->
              <td class="py-3.5 px-3">
                <span class="px-2.5 py-1 rounded-lg font-bold text-xs bg-gray-100 text-gray-900">
                  {{ entry.symbolName || `Symbol #${entry.symbolId}` }}
                </span>
              </td>

              <!-- Setup & Session -->
              <td class="py-3.5 px-3">
                <div class="font-bold text-gray-900">
                  {{ entry.setupName || `Setup #${entry.setupId}` }}
                </div>
                <div v-if="entry.sessionName" class="text-[11px] text-primary font-semibold flex items-center gap-1 mt-0.5">
                  <i class="ph ph-sun-horizon"></i>
                  {{ entry.sessionName }}
                </div>
              </td>

              <!-- Timeframe -->
              <td class="py-3.5 px-3 text-center">
                <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-700">
                  {{ entry.timeframe || '-' }}
                </span>
              </td>

              <!-- Quality / News -->
              <td class="py-3.5 px-3 text-center">
                <div class="flex items-center justify-center gap-1.5 flex-wrap">
                  <span
                    v-if="entry.quality"
                    class="px-2 py-0.5 rounded text-[10px] font-bold"
                    :class="getQualityClass(entry.quality)"
                  >
                    {{ entry.quality }}
                  </span>
                  <span
                    v-if="entry.news"
                    class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800"
                    title="มีข่าวสำคัญ (Impact News)"
                  >
                    📰 ข่าว
                  </span>
                </div>
              </td>

              <!-- Zone Summary Badges -->
              <td class="py-3.5 px-4">
                <div v-if="!entry.zones || entry.zones.length === 0" class="text-gray-400 text-[11px]">
                  ไม่มีโซน
                </div>
                <div v-else class="flex flex-wrap gap-1.5">
                  <span
                    v-for="z in entry.zones"
                    :key="z.id"
                    class="px-2 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                    :class="getZoneOutcomeClass(z)"
                  >
                    <span class="font-bold text-gray-900">{{ z.customColumnName || 'Zone' }}:</span>
                    <span>{{ formatZoneOutcomeText(z) }}</span>
                  </span>
                </div>
              </td>

              <!-- Images -->
              <td class="py-3.5 px-3 text-center">
                <button
                  v-if="getImages(entry).length > 0"
                  type="button"
                  @click="openLightbox(getImages(entry))"
                  class="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold text-xs"
                  title="ดูรูปภาพ Screenshots"
                >
                  <i class="ph ph-image text-base"></i>
                  <span>{{ getImages(entry).length }}</span>
                </button>
                <span v-else class="text-gray-300">-</span>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    @click="handleEditEntry(entry.id)"
                    data-testid="edit-entry-btn"
                    class="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    title="แก้ไขไม้สถิติ"
                  >
                    <i class="ph ph-pencil-simple text-base"></i>
                  </button>
                  <button
                    type="button"
                    @click="viewDetails(entry)"
                    data-testid="view-entry-btn"
                    class="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                    title="ดูรายละเอียดไม้"
                  >
                    <i class="ph ph-eye text-base"></i>
                  </button>
                  <button
                    type="button"
                    @click="promptDelete(entry.id)"
                    class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="ลบรายการ"
                  >
                    <i class="ph ph-trash text-base"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <BasePagination
        v-if="filteredEntries.length > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total-items="filteredEntries.length"
        item-label="รายการวิจัย"
      />
    </div>

    <!-- Trade Details Modal -->
    <div
      v-if="selectedEntry"
      @click.self="selectedEntry = null"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4"
    >
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-primary/10 text-primary">
                {{ selectedEntry.symbolName || `Symbol #${selectedEntry.symbolId}` }}
              </span>
              <span class="text-xs font-bold text-gray-500">
                {{ selectedEntry.setupName || `Setup #${selectedEntry.setupId}` }}
              </span>
            </div>
            <h2 class="text-xl font-extrabold text-gray-900">
              รายละเอียดการจดสถิติ (Research Entry Details)
            </h2>
            <p class="text-xs text-gray-400 mt-0.5">
              บันทึกเมื่อ: {{ formatFullDatetime(selectedEntry.entryDatetime) }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="handleEditEntry(selectedEntry.id)"
              data-testid="modal-edit-entry-btn"
              class="px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="แก้ไขรายการนี้"
            >
              <i class="ph ph-pencil-simple text-sm"></i>
              <span>แก้ไขรายการ</span>
            </button>
            <button
              type="button"
              @click="selectedEntry = null"
              class="text-gray-400 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <i class="ph ph-x text-xl"></i>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1 bg-gray-50/50">
          <!-- Overview Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
            <div>
              <span class="text-[11px] font-bold text-gray-400 block uppercase">Session</span>
              <span class="font-bold text-sm text-gray-800">{{ selectedEntry.sessionName || '-' }}</span>
            </div>
            <div>
              <span class="text-[11px] font-bold text-gray-400 block uppercase">Timeframe</span>
              <span class="font-bold text-sm text-gray-800">{{ selectedEntry.timeframe || '-' }}</span>
            </div>
            <div>
              <span class="text-[11px] font-bold text-gray-400 block uppercase">Quality</span>
              <span class="font-bold text-sm text-gray-800">{{ selectedEntry.quality || '-' }}</span>
            </div>
            <div>
              <span class="text-[11px] font-bold text-gray-400 block uppercase">ข่าว (News)</span>
              <span class="font-bold text-sm" :class="selectedEntry.news ? 'text-amber-600' : 'text-gray-600'">
                {{ selectedEntry.news ? 'มีข่าวสำคัญ' : 'ไม่มีข่าว' }}
              </span>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="selectedEntry.notes" class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
            <h4 class="text-xs font-bold text-gray-600 uppercase mb-2 flex items-center gap-1.5">
              <i class="ph ph-note text-primary"></i>
              หมายเหตุ (Notes)
            </h4>
            <p class="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
              {{ selectedEntry.notes }}
            </p>
          </div>

          <!-- Custom Fields Info -->
          <div
            v-if="selectedEntry.customData && Object.keys(selectedEntry.customData).length > 0"
            class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs"
          >
            <h4 class="text-xs font-bold text-gray-800 uppercase mb-3 flex items-center gap-1.5">
              <i class="ph ph-sliders-horizontal text-primary"></i>
              ข้อมูลเพิ่มเติม (Custom Fields)
            </h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div
                v-for="(val, colKey) in selectedEntry.customData"
                :key="colKey"
                class="bg-gray-50/70 p-3 rounded-xl border border-gray-100 flex flex-col"
              >
                <span class="text-[11px] font-bold text-gray-500 uppercase">
                  {{ getColumnName(colKey) }}
                </span>
                <span class="text-xs font-semibold text-gray-900 mt-1">
                  {{ formatCustomValue(val) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Zone Breakdown Table -->
          <div class="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
            <div class="p-4 border-b border-gray-100">
              <h4 class="text-xs font-bold text-gray-800 uppercase flex items-center gap-1.5">
                <i class="ph ph-stack text-primary"></i>
                รายละเอียดแต่ละโซน (Recorded Zone Parameters)
              </h4>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
                    <th class="py-3 px-4">โซน (Zone Name)</th>
                    <th class="py-3 px-3">Bias</th>
                    <th class="py-3 px-3 text-center">Min RR</th>
                    <th class="py-3 px-3 text-center">Max RR</th>
                    <th class="py-3 px-3 text-center">SL Points</th>
                    <th class="py-3 px-3 text-center">ผลลัพธ์</th>
                    <th class="py-3 px-4">โน้ตเฉพาะโซน</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 font-medium text-gray-800">
                  <tr v-for="z in selectedEntry.zones" :key="z.id" class="hover:bg-gray-50/50">
                    <td class="py-3 px-4 font-bold text-gray-900">
                      {{ z.customColumnName || `Custom Column #${z.customColumnId}` }}
                    </td>
                    <td class="py-3 px-3">
                      <span
                        v-if="z.bias"
                        class="px-2 py-0.5 rounded text-[10px] font-bold"
                        :class="z.bias === 'Bullish' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'"
                      >
                        {{ z.bias }}
                      </span>
                      <span v-else class="text-gray-400">-</span>
                    </td>
                    <td class="py-3 px-3 text-center font-bold">
                      <span v-if="z.isMissed" class="text-amber-600">ตกรถ</span>
                      <span v-else-if="z.minRr !== null" :class="z.minRr > 0 ? 'text-emerald-600' : z.minRr < 0 ? 'text-red-600' : 'text-gray-600'">
                        {{ z.minRr }}R
                      </span>
                      <span v-else>-</span>
                    </td>
                    <td class="py-3 px-3 text-center font-bold text-purple-700">
                      <span v-if="z.isMissed">-</span>
                      <span v-else-if="z.maxRr !== null">{{ z.maxRr }}R</span>
                      <span v-else>-</span>
                    </td>
                    <td class="py-3 px-3 text-center font-mono">
                      <div>{{ (z.slPoints ?? z.minSlPoints) !== null ? `${z.slPoints ?? z.minSlPoints} pts` : '-' }}</div>
                      <div v-if="z.realSlPoints !== null && z.realSlPoints !== undefined" class="text-amber-600 text-[10px] font-sans font-bold">
                        Real: {{ z.realSlPoints }} pts
                      </div>
                    </td>
                    <td class="py-3 px-3 text-center">
                      <span
                        class="px-2.5 py-0.5 rounded-lg text-[10px] font-bold"
                        :class="getZoneOutcomeClass(z)"
                      >
                        {{ formatZoneOutcomeText(z) }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-gray-500 text-[11px]">
                      {{ z.notes || '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Screenshots Gallery -->
          <div v-if="getImages(selectedEntry).length > 0" class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
            <h4 class="text-xs font-bold text-gray-800 uppercase mb-3 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <i class="ph ph-image text-primary"></i>
                ภาพหน้าจอประกอบ (Screenshots - {{ getImages(selectedEntry).length }})
              </span>
              <button
                type="button"
                @click="openLightbox(getImages(selectedEntry))"
                class="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <i class="ph ph-corners-out"></i>
                ดูภาพใหญ่
              </button>
            </h4>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                v-for="(img, idx) in getImages(selectedEntry)"
                :key="idx"
                @click="openLightbox(getImages(selectedEntry), idx)"
                class="group relative aspect-video rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:border-primary transition-all"
              >
                <img :src="formatImageUrl(img)" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                  <i class="ph ph-magnifying-glass-plus text-base"></i>
                  ขยาย
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 border-t border-gray-100 bg-white flex justify-end">
          <button
            type="button"
            @click="selectedEntry = null"
            data-testid="close-entry-details-btn"
            class="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-xs font-bold cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>

    <!-- Image Lightbox Modal -->
    <div
      v-if="lightboxImages.length > 0"
      @click.self="lightboxImages = []"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
    >
      <div class="absolute top-5 right-5 flex items-center gap-3 z-50">
        <button
          type="button"
          @click="lightboxImages = []"
          class="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          title="ปิด"
        >
          <i class="ph ph-x text-xl"></i>
        </button>
      </div>

      <!-- Left Arrow -->
      <button
        v-if="lightboxImages.length > 1"
        type="button"
        @click="prevLightboxImage"
        class="absolute left-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-50"
      >
        <i class="ph ph-caret-left text-2xl"></i>
      </button>

      <!-- Main Image Display -->
      <div class="max-w-5xl max-h-[85vh] flex flex-col items-center justify-center">
        <img
          :src="formatImageUrl(lightboxImages[lightboxIndex])"
          class="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
        />
        <div v-if="lightboxImages.length > 1" class="text-white/70 text-xs font-semibold mt-3">
          {{ lightboxIndex + 1 }} / {{ lightboxImages.length }}
        </div>
      </div>

      <!-- Right Arrow -->
      <button
        v-if="lightboxImages.length > 1"
        type="button"
        @click="nextLightboxImage"
        class="absolute right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-50"
      >
        <i class="ph ph-caret-right text-2xl"></i>
      </button>
    </div>

    <!-- Delete Confirmation Modal -->
    <BaseConfirmModal
      :is-open="showDeleteConfirm"
      title="ยืนยันการลบรายการวิจัย"
      message="คุณแน่ใจหรือไม่ว่าต้องการลบรายการวิจัยนี้? ข้อมูลสถิติและโซนที่ผูกไว้จะถูกลบถาวร"
      confirm-text="ลบรายการ"
      cancel-text="ยกเลิก"
      variant="danger"
      @confirm="executeDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type {
  ResearchFilters,
  ResearchAnalyticsSummary,
  ResearchExportPayload
} from '../../../../shared/types'
import ResearchFilterBar from '../ui/research/ResearchFilterBar.vue'
import ZoneComparisonTable from '../ui/research/ZoneComparisonTable.vue'
import ZonePerformanceChart from '../ui/research/ZonePerformanceChart.vue'
import BasePagination from '../ui/BasePagination.vue'
import BaseConfirmModal from '../ui/BaseConfirmModal.vue'

const router = useRouter()

// State
const loading = ref(false)
const setups = ref<Array<{ id: number; name: string }>>([])
const symbols = ref<Array<{ id: number; name: string }>>([])
const entries = ref<any[]>([])
const analyticsData = ref<ResearchAnalyticsSummary | null>(null)

// Export & Notification State
const isExportMenuOpen = ref(false)
const exportToast = ref<{ show: boolean; message: string; type: 'success' | 'error' }>({
  show: false,
  message: '',
  type: 'success'
})

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  exportToast.value = { show: true, message, type }
  setTimeout(() => {
    exportToast.value.show = false
  }, 4500)
}

// Filters & Search
const filters = ref<ResearchFilters>({
  setupId: undefined,
  symbolId: undefined,
  sessionName: undefined,
  timeframe: undefined,
  news: undefined,
  quality: undefined,
  startDate: undefined,
  endDate: undefined
})
const searchQuery = ref('')

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)

// Modals
const selectedEntry = ref<any>(null)
const showDeleteConfirm = ref(false)
const entryToDeleteId = ref<number | null>(null)

// Lightbox
const lightboxImages = ref<string[]>([])
const lightboxIndex = ref(0)

const totalEntriesCount = computed(() => entries.value.length)

// Filter entries locally based on searchQuery
const filteredEntries = computed(() => {
  if (!searchQuery.value.trim()) return entries.value
  const query = searchQuery.value.toLowerCase().trim()
  return entries.value.filter((e) => {
    const symbol = (e.symbolName || '').toLowerCase()
    const setup = (e.setupName || '').toLowerCase()
    const session = (e.sessionName || '').toLowerCase()
    const notes = (e.notes || '').toLowerCase()
    const tf = (e.timeframe || '').toLowerCase()
    return (
      symbol.includes(query) ||
      setup.includes(query) ||
      session.includes(query) ||
      notes.includes(query) ||
      tf.includes(query)
    )
  })
})

const paginatedEntries = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredEntries.value.slice(start, start + pageSize.value)
})

const columnMap = ref<Map<number, string>>(new Map())

const getColumnName = (colKey: string | number) => {
  const id = Number(colKey)
  return columnMap.value.get(id) || `Field #${colKey}`
}

const formatCustomValue = (val: any) => {
  if (val === true) return 'Yes / ติ๊กถูก'
  if (val === false) return 'No / ไม่ได้ติ๊ก'
  if (Array.isArray(val)) return val.length > 0 ? val.join(', ') : '-'
  if (val === null || val === undefined || val === '') return '-'
  return String(val)
}

const loadSetupsAndSymbols = async () => {
  try {
    const [setupsRes, symbolsRes, colsRes] = await Promise.all([
      window.api.research.setups.list(),
      window.api.symbols.list(),
      window.api.research.customColumns.listLibrary()
    ])
    if (setupsRes.success && setupsRes.data) {
      setups.value = setupsRes.data
    }
    if (symbolsRes.success && symbolsRes.data) {
      symbols.value = symbolsRes.data
    }
    if (colsRes.success && colsRes.data) {
      for (const col of colsRes.data) {
        columnMap.value.set(col.id, col.name)
      }
    }
  } catch (err) {
    console.error('Failed to load setups/symbols for filter:', err)
  }
}

const loadDashboardData = async () => {
  loading.value = true
  try {
    const cleanFilters = JSON.parse(JSON.stringify(filters.value))
    const [analyticsRes, entriesRes] = await Promise.all([
      window.api.research.entries.getAnalytics(cleanFilters),
      window.api.research.entries.list(cleanFilters)
    ])

    if (analyticsRes.success && analyticsRes.data) {
      analyticsData.value = analyticsRes.data
    } else {
      analyticsData.value = null
    }

    if (entriesRes.success && entriesRes.data) {
      entries.value = entriesRes.data
    } else {
      entries.value = []
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err)
  } finally {
    loading.value = false
  }
}

const onFilterChange = () => {
  currentPage.value = 1
  loadDashboardData()
}

// Actions
const viewDetails = (entry: any) => {
  selectedEntry.value = entry
}

const handleEditEntry = (id: number) => {
  if (selectedEntry.value) {
    selectedEntry.value = null
  }
  router.push({ path: '/research/entry', query: { id } })
}

const buildExportPayload = async (format: 'md' | 'json' = 'md'): Promise<ResearchExportPayload> => {
  let setupName = 'All Setups'
  let setupDescription = ''
  let playbookContent = ''

  if (filters.value.setupId) {
    const found = setups.value.find((s) => s.id === filters.value.setupId)
    if (found) setupName = found.name

    try {
      const pbRes = await window.api.research.playbooks.get(filters.value.setupId)
      if (pbRes.success && pbRes.data) {
        playbookContent = pbRes.data.content || ''
      }
    } catch (e) {
      console.warn('Could not fetch playbook for export:', e)
    }
  }

  return {
    setupName,
    setupDescription,
    playbookContent,
    filters: JSON.parse(JSON.stringify(filters.value)),
    analytics: analyticsData.value ? JSON.parse(JSON.stringify(analyticsData.value)) : undefined,
    entries: JSON.parse(JSON.stringify(entries.value)),
    format,
    defaultName: `research_${setupName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`
  }
}

const handleExportAi = async (format: 'md' | 'json' = 'md') => {
  isExportMenuOpen.value = false
  if (entries.value.length === 0) {
    showToast('ไม่มีข้อมูลสถิติสำหรับการส่งออก', 'error')
    return
  }
  try {
    const payload = await buildExportPayload(format)
    const res = await window.api.research.export.ai(payload)
    if (res.success && res.filePath) {
      showToast(`ส่งออกไฟล์ AI Analysis เรียบร้อยแล้ว: ${res.filePath}`, 'success')
    } else if (res.canceled) {
      // User canceled save dialog
    } else {
      showToast(`ส่งออกล้มเหลว: ${res.error}`, 'error')
    }
  } catch (err: any) {
    showToast(`เกิดข้อผิดพลาด: ${err.message}`, 'error')
  }
}

const handleCopyAiPrompt = async () => {
  isExportMenuOpen.value = false
  if (entries.value.length === 0) {
    showToast('ไม่มีข้อมูลสถิติสำหรับการคัดลอก', 'error')
    return
  }
  try {
    const payload = await buildExportPayload('md')
    const res = await window.api.research.export.generateAiReport(payload)
    if (res.success && res.content) {
      await navigator.clipboard.writeText(res.content)
      showToast('คัดลอก AI Prompt และตารางวิจัยลงคลิปบอร์ดแล้ว! พร้อมนำไปวางใน ChatGPT/Claude', 'success')
    } else {
      showToast(`สร้าง AI Prompt ล้มเหลว: ${res.error}`, 'error')
    }
  } catch (err: any) {
    showToast(`เกิดข้อผิดพลาดในการคัดลอก: ${err.message}`, 'error')
  }
}

const handleExportExcel = async () => {
  isExportMenuOpen.value = false
  if (entries.value.length === 0) {
    showToast('ไม่มีข้อมูลสถิติสำหรับการส่งออก', 'error')
    return
  }
  try {
    let setupName = 'all_setups'
    if (filters.value.setupId) {
      const found = setups.value.find((s) => s.id === filters.value.setupId)
      if (found) setupName = found.name
    }
    const res = await window.api.research.export.excel({
      entries: JSON.parse(JSON.stringify(entries.value)),
      analytics: analyticsData.value ? JSON.parse(JSON.stringify(analyticsData.value)) : undefined,
      setupName,
      defaultName: `research_${setupName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`
    })
    if (res.success && res.filePath) {
      showToast(`ส่งออกไฟล์ Excel เรียบร้อยแล้ว: ${res.filePath}`, 'success')
    } else if (res.canceled) {
      // User canceled save dialog
    } else {
      showToast(`ส่งออกล้มเหลว: ${res.error}`, 'error')
    }
  } catch (err: any) {
    showToast(`เกิดข้อผิดพลาด: ${err.message}`, 'error')
  }
}

const closeExportOnOutsideClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('[data-testid="research-export-dropdown-btn"]') && isExportMenuOpen.value) {
    isExportMenuOpen.value = false
  }
}

const promptDelete = (id: number) => {
  entryToDeleteId.value = id
  showDeleteConfirm.value = true
}

const executeDelete = async () => {
  if (!entryToDeleteId.value) return
  try {
    const res = await window.api.research.entries.delete(entryToDeleteId.value)
    if (res.success) {
      showDeleteConfirm.value = false
      entryToDeleteId.value = null
      await loadDashboardData()
    } else {
      alert(`ลบรายการไม่สำเร็จ: ${res.error}`)
    }
  } catch (err) {
    console.error('Delete entry failed:', err)
  }
}

// Lightbox helpers
const openLightbox = (imgs: string[], index = 0) => {
  lightboxImages.value = imgs
  lightboxIndex.value = index
}

const prevLightboxImage = () => {
  if (lightboxImages.value.length === 0) return
  lightboxIndex.value =
    lightboxIndex.value === 0
      ? lightboxImages.value.length - 1
      : lightboxIndex.value - 1
}

const nextLightboxImage = () => {
  if (lightboxImages.value.length === 0) return
  lightboxIndex.value =
    lightboxIndex.value === lightboxImages.value.length - 1
      ? 0
      : lightboxIndex.value + 1
}

// Utility formatters
const getImages = (entry: any): string[] => {
  if (!entry || !entry.images) return []
  if (Array.isArray(entry.images)) return entry.images
  try {
    return JSON.parse(entry.images)
  } catch {
    return []
  }
}

const formatImageUrl = (url: string) => {
  if (!url) return ''
  const tvMatch = url.match(/tradingview\.com\/x\/([a-zA-Z0-9]+)/)
  if (tvMatch && tvMatch[1]) {
    const id = tvMatch[1]
    return `https://s3.tradingview.com/snapshots/${id[0].toLowerCase()}/${id}.png`
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `app-img://${url}`
}

const formatDate = (isoString?: string) => {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return d.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  })
}

const formatTime = (isoString?: string) => {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return d.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFullDatetime = (isoString?: string) => {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return d.toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

const getQualityClass = (quality?: string) => {
  switch (quality) {
    case 'A+':
      return 'bg-purple-100 text-purple-800'
    case 'A':
      return 'bg-emerald-100 text-emerald-800'
    case 'B':
      return 'bg-blue-100 text-blue-800'
    case 'C':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getZoneOutcomeClass = (zone: any) => {
  if (zone.isMissed || zone.outcome === 'missed') {
    return 'bg-amber-100 text-amber-800 border border-amber-200'
  }
  if (zone.minRr !== null && zone.minRr > 0) {
    return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
  }
  if (zone.minRr === -1 || zone.outcome === 'loss') {
    return 'bg-red-100 text-red-800 border border-red-200'
  }
  if (zone.minRr === 0 || zone.outcome === 'be') {
    return 'bg-gray-100 text-gray-700 border border-gray-200'
  }
  return 'bg-gray-100 text-gray-600'
}

const formatZoneOutcomeText = (zone: any) => {
  if (zone.isMissed || zone.outcome === 'missed') return 'ตกรถ'
  if (zone.minRr !== null && zone.minRr > 0) return `+${zone.minRr}R`
  if (zone.minRr === -1 || zone.outcome === 'loss') return '-1R'
  if (zone.minRr === 0 || zone.outcome === 'be') return '0R (BE)'
  return '-'
}

onMounted(async () => {
  window.addEventListener('click', closeExportOnOutsideClick)
  await loadSetupsAndSymbols()
  await loadDashboardData()
})

onUnmounted(() => {
  window.removeEventListener('click', closeExportOnOutsideClick)
})
</script>
