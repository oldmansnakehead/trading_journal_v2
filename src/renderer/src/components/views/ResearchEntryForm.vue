<template>
  <div class="p-6 md:p-8 w-full max-w-5xl mx-auto pb-24">
    <!-- Header -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-primary/10 text-primary uppercase tracking-wider">
            Trade Research
          </span>
          <span v-if="entryStore.isEditMode" class="px-2.5 py-0.5 text-xs font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            โหมดแก้ไขไม้ #{{ entryStore.editingEntryId }}
          </span>
          <span v-if="entryStore.enableExitDate" class="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            Exit Date Enabled
          </span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">
          {{ entryStore.isEditMode ? 'แก้ไขสถิติ (Edit Research Entry)' : 'จดสถิติ (Research Entry Form)' }}
        </h1>
        <p class="text-gray-500 text-sm mt-0.5">
          {{ entryStore.isEditMode ? 'แก้ไขพารามิเตอร์หรือผลลัพธ์ของแต่ละโซนในไม้นี้' : 'บันทึกข้อมูลวิจัยและเปรียบเทียบผลลัพธ์ของแต่ละโซนใน Setup ความเร็วสูง' }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3">
        <button
          v-if="entryStore.isEditMode"
          type="button"
          @click="handleCancelEdit"
          data-testid="research-cancel-edit-btn"
          class="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
        >
          ยกเลิก (Cancel)
        </button>
        <button
          v-else
          type="button"
          @click="entryStore.resetForm"
          data-testid="research-reset-btn"
          class="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
        >
          ล้างฟอร์ม (Reset)
        </button>
        <button
          type="button"
          @click="handleSaveEntry"
          :disabled="!entryStore.isValid || entryStore.isSubmitting"
          data-testid="research-save-btn"
          class="px-6 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <i v-if="entryStore.isSubmitting" class="ph ph-spinner animate-spin text-base"></i>
          <i v-else-if="entryStore.isEditMode" class="ph ph-check-circle text-base"></i>
          <i v-else class="ph ph-floppy-disk text-base"></i>
          {{ entryStore.isEditMode ? 'บันทึกการแก้ไข (Update)' : 'บันทึกสถิติ (Save)' }}
        </button>
      </div>
    </div>

    <!-- Success Toast Notification -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="saveSuccess"
        data-testid="research-success-toast"
        class="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between"
      >
        <div class="flex items-center gap-2 font-semibold text-sm">
          <i class="ph ph-check-circle text-lg text-emerald-600"></i>
          <span v-if="isUpdate">
            อัปเดตข้อมูลสถิติเรียบร้อยแล้ว!
            <button @click="router.push('/research/dashboard')" class="underline ml-2 font-bold cursor-pointer hover:text-emerald-950">
              ไปที่หน้าสรุปผลวิจัย &rarr;
            </button>
          </span>
          <span v-else>
            บันทึกสถิติเรียบร้อยแล้ว! ฟอร์มถูกรีเซ็ตเพื่อพร้อมจดไม้ต่อไปทันที
          </span>
        </div>
        <button @click="saveSuccess = false" class="text-emerald-500 hover:text-emerald-700">
          <i class="ph ph-x text-base"></i>
        </button>
      </div>
    </Transition>

    <!-- Error Alert -->
    <div
      v-if="entryStore.submitError"
      class="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2 font-medium text-sm"
    >
      <i class="ph ph-warning-circle text-lg text-red-600"></i>
      {{ entryStore.submitError }}
    </div>

    <form @submit.prevent="handleSaveEntry" class="flex flex-col gap-6">
      <!-- Section 1: Setup, Symbol & Session Bar -->
      <div class="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col gap-5">
        <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
          <i class="ph ph-crosshair text-primary text-base"></i>
          1. ข้อมูลหลัก (Setup, สินทรัพย์ และ เวลาเข้า)
        </h2>

        <!-- Sub-row 1: Setup & Symbol -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Setup Selection -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase">
              Trading Setup *
            </label>
            <select
              v-model="entryStore.setupId"
              @change="entryStore.onSelectSetup(Number(entryStore.setupId))"
              data-testid="research-setup-select"
              class="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option v-for="s in entryStore.setups" :key="s.id" :value="s.id">
                {{ s.name }} ({{ s.type }})
              </option>
            </select>
          </div>

          <!-- Symbol Selection -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase">
              Symbol *
            </label>
            <select
              v-model="entryStore.symbolId"
              data-testid="research-symbol-select"
              class="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option v-for="sym in entryStore.symbols" :key="sym.id" :value="sym.id">
                {{ sym.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Sub-row 2: Entry Datetime & Exit Datetime -->
        <!-- When Exit Date is enabled: Entry (50%) | Exit (50%) for maximum breathing room -->
        <!-- When Exit Date is disabled: Entry (50%) | Session (50%) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Entry Datetime -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase">
              เวลาเข้า (Entry Datetime) *
            </label>
            <input
              type="datetime-local"
              v-model="entryStore.entryDatetime"
              @input="entryStore.onEntryDatetimeChange"
              @change="entryStore.onEntryDatetimeChange"
              data-testid="research-entry-datetime"
              class="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <!-- Exit Datetime (Placed right after Entry Datetime when enabled) -->
          <div v-if="entryStore.enableExitDate" data-testid="research-exit-date-container">
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-emerald-700 uppercase flex items-center gap-1">
                <i class="ph ph-clock-countdown"></i>
                เวลาออก (Exit Datetime)
              </label>
              <span class="text-[10px] text-emerald-600 font-bold bg-emerald-100/70 px-2 py-0.5 rounded whitespace-nowrap">
                Auto-copied
              </span>
            </div>
            <input
              type="datetime-local"
              v-model="entryStore.exitDatetime"
              :min="entryStore.entryDatetime"
              data-testid="research-exit-datetime"
              class="w-full px-3.5 py-2 bg-emerald-50/50 border border-emerald-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <!-- Session (Placed in row 2 when Exit Date is disabled) -->
          <div v-else>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-bold text-gray-700 uppercase">
                Session
              </label>
              <span class="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded whitespace-nowrap">
                Auto-detect
              </span>
            </div>
            <select
              v-model="entryStore.sessionName"
              data-testid="research-session-select"
              class="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option :value="null">-- ไม่ระบุ --</option>
              <option value="Asia">Asia</option>
              <option value="Tokyo">Tokyo</option>
              <option value="London">London</option>
              <option value="London Close">London Close</option>
              <option value="New York">New York</option>
            </select>
          </div>
        </div>

        <!-- Sub-row 3: Session (if exit date enabled), Timeframe, and Quality -->
        <div
          class="grid grid-cols-1 gap-4"
          :class="entryStore.enableExitDate ? 'sm:grid-cols-3' : 'sm:grid-cols-2'"
        >
          <!-- Session (Shown in Sub-row 3 only if Exit Date is enabled) -->
          <div v-if="entryStore.enableExitDate">
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-bold text-gray-700 uppercase">
                Session
              </label>
              <span class="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded whitespace-nowrap">
                Auto-detect
              </span>
            </div>
            <select
              v-model="entryStore.sessionName"
              data-testid="research-session-select"
              class="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option :value="null">-- ไม่ระบุ --</option>
              <option value="Asia">Asia</option>
              <option value="Tokyo">Tokyo</option>
              <option value="London">London</option>
              <option value="London Close">London Close</option>
              <option value="New York">New York</option>
            </select>
          </div>

          <!-- Timeframe -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase">
              Timeframe
            </label>
            <select
              v-model="entryStore.timeframe"
              data-testid="research-timeframe-select"
              class="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="M1">M1</option>
              <option value="M3">M3</option>
              <option value="M5">M5</option>
              <option value="M15">M15</option>
              <option value="M30">M30</option>
              <option value="H1">H1</option>
              <option value="H4">H4</option>
              <option value="D1">D1</option>
            </select>
          </div>

          <!-- Quality Grade -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5 uppercase">
              Trade Quality
            </label>
            <select
              v-model="entryStore.quality"
              data-testid="research-quality-select"
              class="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="A+">A+ (คุณภาพสูงสุด)</option>
              <option value="A">A (เกรดมาตรฐาน)</option>
              <option value="B">B (ปานกลาง)</option>
              <option value="C">C (ความเสี่ยงสูง)</option>
            </select>
          </div>
        </div>

        <!-- News Checkbox Bar: Clean full-width row with indicator -->
        <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
          <label class="inline-flex items-center gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              v-model="entryStore.news"
              data-testid="research-news-checkbox"
              class="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
            />
            <span class="text-xs font-bold text-gray-700 group-hover:text-gray-900 flex items-center gap-1.5 transition-colors">
              <i class="ph ph-newspaper text-amber-500 text-base"></i>
              ช่วงเวลามีข่าว (News Event)
            </span>
          </label>
          <span
            v-if="entryStore.news"
            class="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1"
          >
            <i class="ph ph-warning"></i>
            High-Impact News
          </span>
        </div>
      </div>

      <!-- Section 2: Custom Columns / Entry Zones -->
      <div class="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col gap-5">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-3">
          <div>
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <i class="ph ph-columns text-primary text-base"></i>
              2. บันทึกผลลัพธ์แต่ละโซน (Zone Groups)
            </h2>
            <p class="text-xs text-gray-500 mt-0.5">
              กรอก Min/Max RR, SL Points, ติ๊กตกรถ หรือใช้ปุ่มลัด One-Click Actions เพื่อความรวดเร็ว
            </p>
          </div>

          <span class="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
            {{ entryStore.zones.length }} โซนที่ผูกไว้
          </span>
        </div>

        <div v-if="entryStore.zones.length === 0" class="text-center py-8 border border-dashed border-gray-200 rounded-2xl">
          <p class="text-gray-500 font-medium text-sm">Setup นี้ไม่มีคอลัมน์ประเภท Zone Group</p>
          <router-link
            to="/research/settings"
            class="text-primary hover:underline text-xs font-bold mt-1 inline-block"
          >
            ไปที่หน้าตั้งค่าสถิติเพื่อจัดการ Custom Columns &rarr;
          </router-link>
        </div>

        <!-- Zone Cards Grid -->
        <div v-else class="flex flex-col gap-4">
          <div
            v-for="(zone, idx) in entryStore.zones"
            :key="`${zone.customColumnId}-${idx}`"
            :data-testid="`zone-card-${idx}`"
            class="p-5 rounded-2xl border transition-all"
            :class="
              zone.isNoZone
                ? 'bg-gray-100/60 border-gray-300 opacity-80'
                : zone.isMissed
                ? 'bg-amber-50/30 border-amber-200'
                : zone.minRr === -1
                ? 'bg-red-50/30 border-red-200'
                : zone.minRr && zone.minRr > 0
                ? 'bg-emerald-50/30 border-emerald-200'
                : 'bg-gray-50/40 border-gray-200'
            "
          >
            <!-- Card Header -->
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-gray-200/60 mb-4">
              <div class="flex flex-wrap items-center gap-2 sm:gap-3">
                <span class="w-6 h-6 rounded-lg bg-gray-900 text-white text-xs font-bold flex items-center justify-center">
                  {{ idx + 1 }}
                </span>
                <span class="font-bold text-gray-900 text-base">
                  {{ zone.zoneInstanceName || zone.customColumnName }}
                </span>

                <!-- Duplicate Zone Button -->
                <button
                  type="button"
                  @click="entryStore.duplicateZone(idx)"
                  class="text-[11px] font-bold text-primary hover:text-primary-focus bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="ทำซ้ำโซนนี้ (เช่น มี Breaker Block มากกว่า 1 จุด)"
                >
                  <i class="ph ph-copy"></i>
                  + Duplicate
                </button>

                <!-- Delete Duplicated Zone Button -->
                <button
                  v-if="entryStore.zones.filter((z) => z.customColumnId === zone.customColumnId).length > 1"
                  type="button"
                  @click="entryStore.removeDuplicatedZone(idx)"
                  class="text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="ลบโซนย่อยนี้"
                >
                  <i class="ph ph-trash"></i>
                  ลบ
                </button>

                <!-- Status Badge -->
                <span
                  v-if="zone.isNoZone"
                  class="px-2.5 py-0.5 rounded-md text-xs font-bold bg-gray-200 text-gray-700"
                >
                  ไม่เกิดโซน (No Zone)
                </span>
                <span
                  v-else-if="zone.isMissed"
                  class="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800"
                >
                  ตกรถ (Missed)
                </span>
                <span
                  v-else-if="zone.minRr === -1"
                  class="px-2.5 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-800"
                >
                  แพ้ (Loss -1R)
                </span>
                <span
                  v-else-if="zone.minRr === 0"
                  class="px-2.5 py-0.5 rounded-md text-xs font-bold bg-gray-200 text-gray-800"
                >
                  Break Even (0R)
                </span>
                <span
                  v-else-if="zone.minRr && zone.minRr > 0"
                  class="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800"
                >
                  ชนะ (+{{ zone.minRr }}R)
                </span>
              </div>

              <!-- Top Row: Bias & State Checkboxes (Missed / No Zone) -->
              <div class="flex flex-wrap items-center gap-3">
                <!-- Bias Toggle: Bullish / Bearish with Auto-sync on idx 0 -->
                <div class="inline-flex rounded-xl bg-white p-1 border border-gray-200 shadow-2xs">
                  <button
                    type="button"
                    @click="entryStore.onBiasChange(idx, 'Bullish')"
                    :data-testid="`zone-bullish-btn-${idx}`"
                    :disabled="zone.isNoZone"
                    :class="[
                      'px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                      zone.bias === 'Bullish'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-gray-500 hover:text-gray-900',
                      zone.isNoZone ? 'opacity-50 cursor-not-allowed' : ''
                    ]"
                  >
                    <i class="ph ph-trend-up"></i>
                    Bullish
                  </button>
                  <button
                    type="button"
                    @click="entryStore.onBiasChange(idx, 'Bearish')"
                    :data-testid="`zone-bearish-btn-${idx}`"
                    :disabled="zone.isNoZone"
                    :class="[
                      'px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                      zone.bias === 'Bearish'
                        ? 'bg-red-600 text-white shadow-2xs'
                        : 'text-gray-500 hover:text-gray-900',
                      zone.isNoZone ? 'opacity-50 cursor-not-allowed' : ''
                    ]"
                  >
                    <i class="ph ph-trend-down"></i>
                    Bearish
                  </button>
                </div>

                <!-- Checkbox ตกรถ -->
                <label class="inline-flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    :checked="zone.isMissed"
                    :disabled="zone.isNoZone"
                    @change="entryStore.setZoneMissed(idx)"
                    :data-testid="`zone-missed-check-${idx}`"
                    class="w-4 h-4 rounded text-amber-600 focus:ring-amber-500/20 cursor-pointer disabled:opacity-40"
                  />
                  <span class="text-xs font-bold text-gray-700">ตกรถ</span>
                </label>

                <!-- Checkbox ไม่เกิดโซน (No Zone) -->
                <label class="inline-flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    :checked="zone.isNoZone"
                    @change="entryStore.toggleZoneNoZone(idx)"
                    :data-testid="`zone-no-zone-check-${idx}`"
                    class="w-4 h-4 rounded text-gray-600 focus:ring-gray-500/20 cursor-pointer"
                  />
                  <span class="text-xs font-bold text-gray-700">ไม่เกิดโซน</span>
                </label>
              </div>
            </div>

            <!-- Zone Specific Timing & Holding Duration Row -->
            <div
              v-if="!zone.isNoZone"
              class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white/70 rounded-xl mb-3.5 border border-gray-200/70"
            >
              <div>
                <label class="block text-[11px] font-semibold text-gray-600 mb-1">
                  <i class="ph ph-clock mr-1 text-primary"></i>เวลาเข้าโซน (Entry Time)
                </label>
                <input
                  type="datetime-local"
                  v-model="zone.entryDatetime"
                  @change="entryStore.onZoneTimeChange(idx)"
                  class="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-gray-600 mb-1">
                  <i class="ph ph-clock mr-1 text-purple-600"></i>เวลาออกโซน (Exit Time)
                </label>
                <input
                  type="datetime-local"
                  v-model="zone.exitDatetime"
                  @change="entryStore.onZoneTimeChange(idx)"
                  class="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div class="flex items-center gap-2">
                <div class="flex-1">
                  <label class="block text-[11px] font-semibold text-gray-600 mb-1">
                    ระยะเวลาถือ (นาที)
                  </label>
                  <input
                    type="number"
                    v-model.number="zone.holdingDurationMinutes"
                    placeholder="Auto จากเวลา"
                    class="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div class="w-24">
                  <label class="block text-[11px] font-semibold text-gray-600 mb-1">
                    จำนวนแท่ง
                  </label>
                  <input
                    type="number"
                    v-model.number="zone.holdingBars"
                    placeholder="เช่น 5"
                    class="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <!-- Notice if No Zone -->
            <div
              v-if="zone.isNoZone"
              class="py-4 text-center bg-gray-100 rounded-xl mb-3.5 text-xs font-bold text-gray-500 border border-gray-200"
            >
              <i class="ph ph-prohibit mr-1 text-sm"></i>
              รอบนี้ไม่เกิดโซนนี้ให้เล่น (No Zone Formed) - ข้อมูลนี้จะถูกเก็บสถิติ Formation Rate
            </div>

            <!-- Inputs Grid: Min RR, Max RR, SL Points, Real SL -->
            <div v-if="!zone.isNoZone" class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-3.5">
              <!-- Min RR -->
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">
                  Min RR
                </label>
                <input
                  type="number"
                  step="0.01"
                  v-model.number="zone.minRr"
                  :disabled="zone.isMissed || zone.isNoZone"
                  :data-testid="`zone-min-rr-${idx}`"
                  placeholder="เช่น 1.5 หรือ -1"
                  class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>

              <!-- Max RR -->
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">
                  Max RR
                </label>
                <input
                  type="number"
                  step="0.01"
                  v-model.number="zone.maxRr"
                  :disabled="zone.isMissed || zone.isNoZone"
                  :data-testid="`zone-max-rr-${idx}`"
                  placeholder="เช่น 3.0"
                  class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>

              <!-- SL Points (Planned SL) -->
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">
                  SL Points
                </label>
                <input
                  type="number"
                  step="0.1"
                  :value="zone.slPoints ?? zone.minSlPoints"
                  @input="entryStore.onSlPointsChange(idx, ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
                  :data-testid="`zone-sl-${idx}`"
                  placeholder="เช่น 120"
                  class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <!-- Real SL (Optional Drawdown / MAE) -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-semibold text-gray-600">
                    Real SL
                  </label>
                  <span class="text-[10px] text-gray-400">Optional</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  :value="zone.realSlPoints"
                  @input="entryStore.onRealSlPointsChange(idx, ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
                  :data-testid="`zone-real-sl-${idx}`"
                  :disabled="zone.isMissed || zone.isNoZone"
                  placeholder="เว้นว่างได้ถ้าหลุด SL"
                  class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
            </div>

            <!-- Invalidation Reason Selector (When Loss -1R) -->
            <div
              v-if="!zone.isNoZone && (zone.minRr === -1 || zone.outcome === 'loss')"
              class="mb-3.5 p-3 bg-red-50/70 border border-red-200 rounded-xl"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-red-900 flex items-center gap-1.5">
                  <i class="ph ph-warning-circle text-red-600"></i>
                  สาเหตุที่โซนแหก (Invalidation Reason) - คลิกเลือกด่วน:
                </span>
                <span v-if="zone.invalidationReason" class="text-[11px] font-bold text-red-700">
                  ระบุ: {{ zone.invalidationReason }}
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-1.5 mb-2">
                <button
                  v-for="reason in [
                    'สวน HTF',
                    'ข่าวชน',
                    'สภาพคล่องล่อ (Inducement)',
                    'ตลาดวาย (Late Session)',
                    'โดนกวาดไส้ (Spread/Hunt)'
                  ]"
                  :key="reason"
                  type="button"
                  @click="entryStore.setZoneInvalidationReason(idx, reason)"
                  :class="[
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                    zone.invalidationReason === reason
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'bg-white text-gray-700 border border-red-200 hover:bg-red-100/60'
                  ]"
                >
                  {{ reason }}
                </button>
              </div>
              <input
                type="text"
                v-model="zone.invalidationReason"
                placeholder="หรือพิมพ์ระบุเหตุผลเอง เช่น SMT Divergence หลุด..."
                class="w-full px-3 py-1.5 bg-white border border-red-200 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400/20"
              />
            </div>

            <!-- Quick Action Buttons Row -->
            <div v-if="!zone.isNoZone" class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200/50">
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="text-xs font-bold text-gray-400 mr-1">ปุ่มลัด:</span>
                <!-- Loss -1 -->
                <button
                  type="button"
                  @click="entryStore.setZoneLoss(idx)"
                  :data-testid="`zone-sl-loss-btn-${idx}`"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-colors cursor-pointer"
                >
                  [SL (-1)]
                </button>
                <!-- BE 0 -->
                <button
                  type="button"
                  @click="entryStore.setZoneBe(idx)"
                  :data-testid="`zone-be-btn-${idx}`"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  [BE (0)]
                </button>
                <!-- Quick RRs -->
                <button
                  type="button"
                  @click="entryStore.setZoneQuickRr(idx, 1)"
                  class="px-2 py-1 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  +1R
                </button>
                <button
                  type="button"
                  @click="entryStore.setZoneQuickRr(idx, 2)"
                  class="px-2 py-1 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  +2R
                </button>
                <button
                  type="button"
                  @click="entryStore.setZoneQuickRr(idx, 3)"
                  class="px-2 py-1 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  +3R
                </button>
                <button
                  type="button"
                  @click="entryStore.setZoneQuickRr(idx, 5)"
                  class="px-2 py-1 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  +5R
                </button>
              </div>

              <!-- Zone Mini Notes -->
              <div class="w-full sm:w-auto flex-1 sm:max-w-xs">
                <input
                  v-model="zone.notes"
                  placeholder="หมายเหตุย่อของโซนนี้..."
                  class="w-full px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3: Custom Fields (Non-Zone Columns: Checkbox, Selectors, String, Number) -->
      <div
        v-if="entryStore.fieldColumns.length > 0"
        data-testid="research-custom-fields-section"
        class="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col gap-5"
      >
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-3">
          <div>
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <i class="ph ph-sliders-horizontal text-primary text-base"></i>
              3. ข้อมูลเพิ่มเติม (Custom Fields)
            </h2>
            <p class="text-xs text-gray-500 mt-0.5">
              ตัวแปรและข้อมูลเสริมเฉพาะของ Setup นี้
            </p>
          </div>
          <span class="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
            {{ entryStore.fieldColumns.length }} ตัวแปร
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <div
            v-for="col in entryStore.fieldColumns"
            :key="col.id"
            class="flex flex-col gap-1.5"
            :data-testid="`custom-field-${col.id}`"
          >
            <!-- Checkbox -->
            <template v-if="col.type === 'checkbox'">
              <span class="block text-xs font-bold text-gray-700 uppercase">
                {{ col.name }}
              </span>
              <label class="inline-flex items-center gap-2.5 cursor-pointer select-none mt-2">
                <input
                  type="checkbox"
                  v-model="entryStore.customData[col.id]"
                  :data-testid="`custom-field-input-${col.id}`"
                  class="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                />
                <span class="text-sm font-semibold text-gray-800">
                  {{ col.description || col.name }}
                </span>
              </label>
            </template>

            <!-- Single Selector -->
            <template v-else-if="col.type === 'single_selector'">
              <label class="block text-xs font-bold text-gray-700 uppercase">
                {{ col.name }}
              </label>
              <BaseSelect
                v-model="entryStore.customData[col.id]"
                :options="col.options || []"
                placeholder="-- เลือกหนึ่งตัวเลือก --"
                :data-testid="`custom-field-input-${col.id}`"
              />
            </template>

            <!-- Multiple Selector -->
            <template v-else-if="col.type === 'multiple_selector'">
              <label class="block text-xs font-bold text-gray-700 uppercase">
                {{ col.name }}
              </label>
              <BaseMultiSelect
                v-model="entryStore.customData[col.id]"
                :options="col.options || []"
                placeholder="-- เลือกหลายตัวเลือก --"
                :data-testid="`custom-field-input-${col.id}`"
              />
            </template>

            <!-- Number -->
            <template v-else-if="col.type === 'number'">
              <label class="block text-xs font-bold text-gray-700 uppercase">
                {{ col.name }}
              </label>
              <input
                type="number"
                step="any"
                v-model.number="entryStore.customData[col.id]"
                :placeholder="col.description || 'กรอกตัวเลข'"
                :data-testid="`custom-field-input-${col.id}`"
                class="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </template>

            <!-- Text / String (default) -->
            <template v-else>
              <label class="block text-xs font-bold text-gray-700 uppercase">
                {{ col.name }}
              </label>
              <input
                type="text"
                v-model="entryStore.customData[col.id]"
                :placeholder="col.description || 'กรอกข้อความ'"
                :data-testid="`custom-field-input-${col.id}`"
                class="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </template>
          </div>
        </div>
      </div>

      <!-- Section 4: Screenshots & Multiple Images -->
      <div class="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col gap-4">
        <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
          <i class="ph ph-images text-primary text-base"></i>
          {{ entryStore.fieldColumns.length > 0 ? '4. ภาพถ่ายกราฟ (Screenshots)' : '3. ภาพถ่ายกราฟ (Screenshots)' }}
        </h2>

        <!-- Dropzone / Paste Area -->
        <div
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleFileDrop"
          class="border-2 border-dashed rounded-2xl p-6 text-center transition-all"
          :class="isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'"
        >
          <i class="ph ph-cloud-arrow-up text-3xl text-gray-400 mb-2 inline-block"></i>
          <p class="text-sm font-semibold text-gray-800">
            ลากรูปภาพมาวางที่นี่ หรือกดวาง (<kbd class="px-1.5 py-0.5 rounded bg-gray-200 text-xs font-mono">Ctrl + V</kbd>)
          </p>
          <p class="text-xs text-gray-400 mt-1 mb-3">รองรับภาพ PNG, JPG, WEBP</p>

          <label class="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 inline-flex items-center gap-2 cursor-pointer shadow-2xs">
            <i class="ph ph-folder-open text-sm"></i>
            เลือกไฟล์จากเครื่อง
            <input type="file" multiple accept="image/*" @change="handleFileSelect" class="hidden" />
          </label>
        </div>

        <!-- Image URL Input -->
        <div class="flex items-center gap-2">
          <input
            v-model="imageUrlInput"
            @keyup.enter="handleAddImageUrl"
            placeholder="หรือระบุ URL รูปภาพ เช่น https://..."
            class="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            @click="handleAddImageUrl"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
          >
            เพิ่ม URL
          </button>
        </div>

        <!-- Thumbnails Grid -->
        <div v-if="entryStore.images.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          <div
            v-for="(img, idx) in entryStore.images"
            :key="idx"
            class="relative rounded-xl overflow-hidden border border-gray-200 group aspect-video bg-gray-100"
          >
            <img
              :src="formatImageUrl(img)"
              class="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
              @click="previewImage(img)"
            />
            <button
              type="button"
              @click="entryStore.removeImage(idx)"
              class="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              title="Remove image"
            >
              <i class="ph ph-trash text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Section 5: General Notes -->
      <div class="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col gap-3">
        <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
          <i class="ph ph-note-pencil text-primary text-base"></i>
          {{ entryStore.fieldColumns.length > 0 ? '5. หมายเหตุและข้อสังเกตทั่วไป (General Notes)' : '4. หมายเหตุและข้อสังเกตทั่วไป (General Notes)' }}
        </h2>
        <textarea
          v-model="entryStore.notes"
          rows="4"
          placeholder="บันทึกข้อสังเกตเพิ่มเติม เช่น พฤติกรรมราคา การเกิด Liquidity Sweep หรือคำแนะนำสำหรับการเทรดครั้งต่อไป..."
          class="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
        ></textarea>
      </div>

      <!-- Bottom Save Action Bar -->
      <div class="flex justify-end items-center gap-3 pt-4">
        <button
          v-if="entryStore.isEditMode"
          type="button"
          @click="handleCancelEdit"
          class="px-5 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
        >
          ยกเลิกการแก้ไข (Cancel)
        </button>
        <button
          v-else
          type="button"
          @click="entryStore.resetForm"
          class="px-5 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
        >
          ล้างฟอร์ม
        </button>
        <button
          type="button"
          @click="handleSaveEntry"
          :disabled="!entryStore.isValid || entryStore.isSubmitting"
          class="px-8 py-3 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <i v-if="entryStore.isSubmitting" class="ph ph-spinner animate-spin text-base"></i>
          <i v-else-if="entryStore.isEditMode" class="ph ph-check-circle text-base"></i>
          <i v-else class="ph ph-check text-base"></i>
          {{ entryStore.isEditMode ? 'บันทึกการแก้ไข (Update Entry)' : 'บันทึกข้อมูลสถิติ (Save Entry)' }}
        </button>
      </div>
    </form>

    <!-- Lightbox Modal for Image Preview -->
    <div
      v-if="lightboxImage"
      @click="lightboxImage = null"
      class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
    >
      <img
        :src="formatImageUrl(lightboxImage)"
        class="max-w-full max-h-full rounded-xl object-contain drop-shadow-2xl"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useResearchEntryStore } from '../../stores/researchEntry'
import BaseSelect from '../ui/BaseSelect.vue'
import BaseMultiSelect from '../ui/BaseMultiSelect.vue'

const route = useRoute()
const router = useRouter()
const entryStore = useResearchEntryStore()

const saveSuccess = ref(false)
const isUpdate = ref(false)
const isDragging = ref(false)
const imageUrlInput = ref('')
const lightboxImage = ref<string | null>(null)

// Format image URL for custom protocol app-img://
const formatImageUrl = (img: string) => {
  if (img.startsWith('http://') || img.startsWith('https://')) {
    return img
  }
  return `app-img://${img}`
}

const previewImage = (img: string) => {
  lightboxImage.value = img
}

const handleAddImageUrl = () => {
  if (!imageUrlInput.value.trim()) return
  entryStore.addImageUrl(imageUrlInput.value)
  imageUrlInput.value = ''
}

// Cancel edit and navigate back to dashboard
const handleCancelEdit = () => {
  entryStore.cancelEdit()
  router.push('/research/dashboard')
}

// Drag & drop file handling
const handleFileDrop = async (event: DragEvent) => {
  isDragging.value = false
  if (!event.dataTransfer?.files) return
  for (let i = 0; i < event.dataTransfer.files.length; i++) {
    const file = event.dataTransfer.files[i]
    if (file.type.startsWith('image/')) {
      await entryStore.uploadImageFile(file)
    }
  }
}

// File picker handling
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files) return
  for (let i = 0; i < target.files.length; i++) {
    const file = target.files[i]
    if (file.type.startsWith('image/')) {
      await entryStore.uploadImageFile(file)
    }
  }
}

// Global Clipboard Paste (Ctrl + V) for screenshots
const handleGlobalPaste = async (event: ClipboardEvent) => {
  if (!event.clipboardData?.items) return
  for (let i = 0; i < event.clipboardData.items.length; i++) {
    const item = event.clipboardData.items[i]
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        await entryStore.uploadImageFile(file)
      }
    }
  }
}

// Form Submission
const handleSaveEntry = async () => {
  const res = await entryStore.submitEntry()
  if (res.success) {
    isUpdate.value = Boolean(res.isUpdate)
    saveSuccess.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => {
      saveSuccess.value = false
    }, 4000)
  }
}

// Check if route query has an id to load for edit
const checkRouteQuery = async () => {
  if (route.query.id) {
    await entryStore.loadEntryForEdit(Number(route.query.id))
  }
}

watch(
  () => route.query.id,
  async (newId) => {
    if (newId) {
      await entryStore.loadEntryForEdit(Number(newId))
    } else {
      entryStore.cancelEdit()
    }
  }
)

onMounted(async () => {
  window.addEventListener('paste', handleGlobalPaste)
  await entryStore.initialize()
  await checkRouteQuery()
})

onUnmounted(() => {
  window.removeEventListener('paste', handleGlobalPaste)
})
</script>
