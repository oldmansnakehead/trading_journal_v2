<template>
  <div class="p-8 w-full max-w-6xl mx-auto">
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <span class="px-2.5 py-1 text-xs font-bold rounded-lg bg-primary/10 text-primary uppercase tracking-wider">
          Trade Research
        </span>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">ตั้งค่าสถิติวิจัย (Research Settings)</h1>
      <p class="text-gray-500 text-sm">
        จัดการกลยุทธ์วิจัย, สินทรัพย์ (Symbols), เซสชันเวลา, Playbooks (Vue Flow), และ Zone Library
      </p>
    </div>

    <!-- Tabs Navigation -->
    <div class="flex overflow-x-auto no-scrollbar border-b border-gray-200 mb-8 gap-8">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :data-testid="`tab-${tab.id}`"
        @click="activeTab = tab.id"
        :class="[
          'flex items-center gap-2 py-4 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors cursor-pointer',
          activeTab === tab.id
            ? 'border-gray-900 text-gray-900'
            : 'border-transparent text-gray-500 hover:text-gray-900'
        ]"
      >
        <i :class="[tab.icon, 'text-lg']"></i>
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab 1: Trading Setups -->
    <div v-if="activeTab === 'setups'" class="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px] flex flex-col gap-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Research Trading Setups</h2>
          <p class="text-sm text-gray-500 mt-1">
            กำหนดกลยุทธ์ที่ต้องการทดสอบวิจัย และตั้งค่าการใช้งานเวลาออก (Exit Date)
          </p>
        </div>
        <button
          @click="openAddSetupModal"
          data-testid="add-research-setup-btn"
          class="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <i class="ph ph-plus text-base"></i>
          Add Setup
        </button>
      </div>

      <div v-if="settingsStore.setups.length === 0" class="text-center py-16 border border-dashed border-gray-300 rounded-2xl">
        <i class="ph ph-flask text-4xl text-gray-400 mb-2 inline-block"></i>
        <p class="text-gray-500 font-medium">ยังไม่มี Setup วิจัย เริ่มสร้าง Setup แรกเพื่อเริ่มบันทึกสถิติ!</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
        <div
          v-for="setup in settingsStore.setups"
          :key="setup.id"
          class="border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between bg-white relative group"
          :class="settingsStore.selectedSetupId === setup.id ? 'ring-2 ring-primary/20 border-primary' : ''"
          @click="settingsStore.selectSetup(setup.id)"
        >
          <div>
            <div class="flex justify-between items-start mb-3">
              <h3 class="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors">
                {{ setup.name }}
              </h3>
              <span
                class="px-2.5 py-1 text-xs font-bold rounded-lg capitalize"
                :class="
                  setup.type === 'real'
                    ? 'bg-green-100 text-green-700'
                    : setup.type === 'backtest'
                    ? 'bg-purple-100 text-purple-700'
                    : setup.type === 'forward_test'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                "
              >
                {{ setup.type }}
              </span>
            </div>
            <p class="text-sm text-gray-500 mb-4 line-clamp-2">
              {{ setup.description || 'ไม่มีคำอธิบายเพิ่มเติม' }}
            </p>

            <!-- Exit Date status badge -->
            <div class="mb-4">
              <span
                v-if="setup.enableExitDate"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                <i class="ph ph-check-circle text-sm"></i>
                Exit Date: เปิดใช้งาน
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200"
              >
                <i class="ph ph-lightning text-sm"></i>
                Exit Date: ซ่อน (โหมดจดไว)
              </span>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-400">
            <span class="text-gray-400">ID: #{{ setup.id }}</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click.stop="openEditSetupModal(setup)"
                class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="Edit Setup"
              >
                <i class="ph ph-pencil-simple text-base"></i>
              </button>
              <button
                type="button"
                @click.stop="confirmDeleteSetup(setup)"
                class="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete Setup"
              >
                <i class="ph ph-trash text-base"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 2: Symbols (Shared with Journal) -->
    <div v-else-if="activeTab === 'symbols'" class="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px] flex flex-col gap-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Symbols (สินทรัพย์ที่เทรด)</h2>
          <p class="text-sm text-gray-500 mt-1">
            รายการคู่เงินและสินทรัพย์ใช้งานร่วมกันกับ Journal ปกติ (เพิ่มหรือลบได้จากที่นี่)
          </p>
        </div>
      </div>

      <!-- Add Symbol Inline Form -->
      <div class="flex items-center gap-3 p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80">
        <input
          v-model="newSymbolName"
          @keyup.enter="handleCreateSymbol"
          placeholder="ใส่ชื่อคู่เงิน เช่น XAUUSD, EURUSD, BTCUSDT"
          class="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase"
        />
        <button
          @click="handleCreateSymbol"
          :disabled="!newSymbolName.trim()"
          class="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <i class="ph ph-plus text-base"></i>
          Add Symbol
        </button>
      </div>

      <!-- Symbols List -->
      <div v-if="settingsStore.symbols.length === 0" class="text-center py-12 text-gray-400 text-sm">
        ยังไม่มีรายการ Symbol
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div
          v-for="sym in settingsStore.symbols"
          :key="sym.id"
          class="flex items-center justify-between p-3.5 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors shadow-2xs group"
        >
          <span class="font-bold text-sm text-gray-800 tracking-wide">{{ sym.name }}</span>
          <button
            @click="handleDeleteSymbol(sym.id)"
            class="text-gray-300 hover:text-red-500 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
            title="Delete Symbol"
          >
            <i class="ph ph-trash text-sm"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Tab 3: Setup Sessions -->
    <div v-else-if="activeTab === 'setup_sessions'" class="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px] flex flex-col gap-6">
      <div class="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Setup Sessions (ตารางเวลา)</h2>
          <p class="text-sm text-gray-500 mt-1">
            ผูกช่วงเวลากับ Setup เพื่อให้ระบบคำนวณและเลือก Session ให้อัตโนมัติจากเวลาเข้า
          </p>
        </div>

        <div class="flex flex-wrap sm:flex-nowrap items-center gap-3">
          <!-- Setup Selector -->
          <select
            v-model="settingsStore.selectedSetupId"
            @change="settingsStore.selectSetup(Number(settingsStore.selectedSetupId))"
            class="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0"
          >
            <option v-for="s in settingsStore.setups" :key="s.id" :value="s.id">
              {{ s.name }} ({{ s.type }})
            </option>
          </select>

          <button
            @click="handleApplyStandardPresets"
            :disabled="!settingsStore.selectedSetupId || isApplyingResearchPresets"
            data-testid="research-apply-sessions-preset-btn"
            class="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
            title="เพิ่ม 4 เซสชันมาตรฐาน (Asia, London, New York, London Close) อัตโนมัติ"
          >
            <i class="ph ph-lightning text-base"></i>
            {{ isApplyingResearchPresets ? 'กำลังบันทึก...' : 'ใส่ Preset มาตรฐาน (4 เซสชัน)' }}
          </button>

          <button
            @click="openAddSessionModal"
            :disabled="!settingsStore.selectedSetupId"
            class="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <i class="ph ph-plus text-base"></i>
            Add Session
          </button>
        </div>
      </div>

      <div v-if="!settingsStore.selectedSetupId" class="text-center py-16 text-gray-400 text-sm">
        กรุณาเลือก Setup เพื่อจัดการเซสชัน
      </div>
      <div v-else-if="settingsStore.activeSetupDetails.sessions.length === 0" class="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
        <p class="text-gray-500 font-medium">ยังไม่มีการกำหนดเซสชันสำหรับ Setup นี้</p>
        <p class="text-gray-400 text-xs mt-1">เพิ่มช่วงเวลา เช่น Asia (08:00 - 12:00) หรือ London (14:00 - 18:00)</p>
      </div>
      <div v-else class="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase">
              <th class="py-3 px-4">Session Name</th>
              <th class="py-3 px-4">Start Time</th>
              <th class="py-3 px-4">End Time</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 font-medium text-gray-800">
            <tr v-for="s in settingsStore.activeSetupDetails.sessions" :key="s.id" class="hover:bg-gray-50/50">
              <td class="py-3 px-4 font-bold text-gray-900">{{ s.sessionName }}</td>
              <td class="py-3 px-4 font-mono text-gray-600">{{ s.startTime }}</td>
              <td class="py-3 px-4 font-mono text-gray-600">{{ s.endTime }}</td>
              <td class="py-3 px-4 text-right">
                <button
                  @click="handleDeleteSession(s.id)"
                  class="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete Session"
                >
                  <i class="ph ph-trash text-base"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab 4: Setup Playbooks & Vue Flow -->
    <div v-else-if="activeTab === 'setup_playbooks'" class="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px] flex flex-col gap-6">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Setup Playbooks & Flowchart</h2>
          <p class="text-sm text-gray-500 mt-1">
            จดบันทึกทฤษฎี กฎเกณฑ์ และสร้าง Flowchart จำลองกลยุทธ์ด้วย Vue Flow
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Setup Selector -->
          <select
            v-model="settingsStore.selectedSetupId"
            @change="settingsStore.selectSetup(Number(settingsStore.selectedSetupId))"
            class="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option v-for="s in settingsStore.setups" :key="s.id" :value="s.id">
              {{ s.name }}
            </option>
          </select>

          <!-- View Mode Toggle: Flow vs Notes -->
          <div class="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200">
            <button
              type="button"
              @click="playbookMode = 'flow'"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer',
                playbookMode === 'flow' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
              ]"
            >
              <i class="ph ph-tree-structure text-sm"></i>
              Vue Flow
            </button>
            <button
              type="button"
              @click="playbookMode = 'notes'"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer',
                playbookMode === 'notes' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
              ]"
            >
              <i class="ph ph-note-pencil text-sm"></i>
              Rules & Notes
            </button>
          </div>
        </div>
      </div>

      <div v-if="!settingsStore.selectedSetupId" class="text-center py-16 text-gray-400 text-sm">
        กรุณาเลือก Setup ก่อนจัดการ Playbook
      </div>
      <div v-else>
        <!-- Vue Flow Mode -->
        <div v-if="playbookMode === 'flow'" class="w-full rounded-2xl border border-gray-200 overflow-hidden" style="height: 640px;">
          <PlaybookFlowEditor
            :key="settingsStore.selectedSetupId"
            :initial-flow-data="settingsStore.activeSetupDetails.playbookFlowData"
            @save="handleSavePlaybookFlow"
          />
        </div>

        <!-- Notes Mode -->
        <div v-else class="flex flex-col gap-4">
          <textarea
            v-model="playbookNotesContent"
            rows="16"
            placeholder="จดบันทึกเงื่อนไข กฎเกณฑ์ Checklist หรือสมมติฐานการวิจัยของกลยุทธ์นี้อย่างละเอียด..."
            class="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl font-mono text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
          ></textarea>
          <div class="flex justify-end">
            <button
              @click="handleSavePlaybookNotes"
              class="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <i class="ph ph-floppy-disk text-base"></i>
              Save Rules & Notes
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 5: Custom Columns (Zone Library) -->
    <div v-else-if="activeTab === 'custom_columns'" class="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px] flex flex-col gap-8">
      <!-- Section 1: Linked Zones for current setup -->
      <div class="flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Custom Columns (โซนเข้าประจำ Setup)</h2>
            <p class="text-sm text-gray-500 mt-1">
              คอลัมน์โซนเข้าที่จะปรากฏให้กรอก Bias, RR, SL points, และเช็คบ็อกซ์ตกรถในหน้าจดสถิติ
            </p>
          </div>

          <div class="flex items-center gap-3">
            <select
              v-model="settingsStore.selectedSetupId"
              @change="settingsStore.selectSetup(Number(settingsStore.selectedSetupId))"
              class="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option v-for="s in settingsStore.setups" :key="s.id" :value="s.id">
                {{ s.name }}
              </option>
            </select>

            <button
              @click="openLinkZoneModal"
              :disabled="!settingsStore.selectedSetupId"
              data-testid="link-zone-modal-btn"
              class="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
            >
              <i class="ph ph-link text-base"></i>
              Link Zone to Setup
            </button>
          </div>
        </div>

        <div v-if="!settingsStore.selectedSetupId" class="text-center py-10 text-gray-400 text-sm">
          กรุณาเลือก Setup เพื่อดูโซนที่ผูกไว้
        </div>
        <div v-else-if="settingsStore.activeSetupDetails.linkedCustomColumns.length === 0" class="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
          <p class="text-gray-500 font-medium">Setup นี้ยังไม่ได้ผูกโซนเข้าใด ๆ</p>
          <p class="text-gray-400 text-xs mt-1">กดปุ่ม "Link Zone to Setup" เพื่อดึงโซนจาก Library มาใช้งาน</p>
        </div>
        <div v-else class="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase">
                <th class="py-3 px-4 w-16 text-center">Order</th>
                <th class="py-3 px-4">Zone Column Name</th>
                <th class="py-3 px-4">Type</th>
                <th class="py-3 px-4">Description</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 font-medium text-gray-800">
              <tr v-for="(col, idx) in settingsStore.activeSetupDetails.linkedCustomColumns" :key="col.id" class="hover:bg-gray-50/50">
                <td class="py-3 px-4 text-center text-xs font-bold text-gray-400">#{{ idx + 1 }}</td>
                <td class="py-3 px-4 font-bold text-gray-900">{{ col.name }}</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                    {{ col.type }}
                  </span>
                </td>
                <td class="py-3 px-4 text-gray-500 text-xs">{{ col.description || '-' }}</td>
                <td class="py-3 px-4 text-right">
                  <button
                    @click="handleUnlinkColumn(col.id)"
                    class="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors text-xs font-semibold inline-flex items-center gap-1"
                    title="Unlink Zone"
                  >
                    <i class="ph ph-link-break text-base"></i>
                    Unlink
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 2: Master Zone Library -->
      <div class="pt-6 border-t border-gray-200 flex flex-col gap-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-bold text-gray-900">Master Zone Library (คลังโซนส่วนกลาง)</h3>
            <p class="text-sm text-gray-500 mt-0.5">
              สร้างโซนครั้งเดียวเพื่อนำไปแชร์ใช้งานกับหลาย Setup ได้ตามต้องการ
            </p>
          </div>
          <button
            @click="openAddMasterColumnModal"
            data-testid="create-zone-def-btn"
            class="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <i class="ph ph-plus text-base"></i>
            Create Zone Definition
          </button>
        </div>

        <div v-if="settingsStore.libraryCustomColumns.length === 0" class="text-center py-10 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
          ยังไม่มีโซนใน Master Library สร้างโซนแรก เช่น "Zone FVG", "Zone OB", "Zone Liquidity Sweep"
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="col in settingsStore.libraryCustomColumns"
            :key="col.id"
            class="p-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-white flex flex-col justify-between shadow-2xs group"
          >
            <div>
              <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold text-gray-900 text-base">{{ col.name }}</h4>
                <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-600">
                  {{ col.type }}
                </span>
              </div>
              <p class="text-xs text-gray-500 line-clamp-2 mb-3">
                {{ col.description || 'ไม่มีคำอธิบาย' }}
              </p>
            </div>

            <div class="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>ใช้ใน {{ col.linkedSetupIds?.length || 0 }} Setups</span>
              <div class="flex items-center gap-1.5">
                <button
                  @click="openEditMasterColumnModal(col)"
                  class="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  title="Edit Zone"
                >
                  <i class="ph ph-pencil-simple text-sm"></i>
                </button>
                <button
                  @click="handleDeleteMasterColumn(col.id)"
                  class="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50"
                  title="Delete Zone"
                >
                  <i class="ph ph-trash text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== MODALS ==================== -->

    <!-- Modal: Add / Edit Setup -->
    <div
      v-if="isSetupModalOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-lg font-bold text-gray-900">
            {{ editingSetupId ? 'แก้ไข Research Setup' : 'สร้าง Research Setup ใหม่' }}
          </h3>
          <button @click="isSetupModalOpen = false" class="text-gray-400 hover:text-gray-600">
            <i class="ph ph-x text-xl"></i>
          </button>
        </div>

        <div class="p-6 flex flex-col gap-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อ Setup *</label>
            <input
              v-model="setupForm.name"
              data-testid="research-setup-name-input"
              placeholder="เช่น OB + FVG Reversal"
              class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">ประเภท (Type) *</label>
            <select
              v-model="setupForm.type"
              class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="backtest">Backtest (ทดสอบย้อนหลัง)</option>
              <option value="forward_test">Forward Test (ทดสอบแบบเรียลไทม์)</option>
              <option value="demo">Demo (พอร์ตจำลอง)</option>
              <option value="real">Real (พอร์ตจริง)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">คำอธิบาย</label>
            <textarea
              v-model="setupForm.description"
              rows="3"
              placeholder="ระบุสมมติฐานหรือไอเดียของกลยุทธ์วิจัยนี้..."
              class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            ></textarea>
          </div>

          <!-- Switch: Enable Exit Date -->
          <div class="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex items-start gap-3">
            <input
              id="enable-exit-date-toggle"
              type="checkbox"
              v-model="setupForm.enableExitDate"
              class="mt-1 w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
            />
            <label for="enable-exit-date-toggle" class="cursor-pointer select-none">
              <span class="block text-sm font-bold text-gray-900">เปิดใช้งาน Exit Date</span>
              <span class="block text-xs text-gray-500 mt-0.5">
                หากเปิด ในหน้าจดสถิติจะมีช่องวันเวลาออกให้กรอก หากปิดจะซ่อนไว้เพื่อความรวดเร็วในการจด
              </span>
            </label>
          </div>
        </div>

        <div class="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
          <button
            @click="isSetupModalOpen = false"
            class="px-4 py-2.5 border border-gray-200 hover:bg-gray-100 rounded-xl font-semibold text-sm text-gray-600 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            @click="handleSaveSetup"
            :disabled="!setupForm.name.trim()"
            data-testid="save-research-setup-btn"
            class="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Add Session -->
    <div
      v-if="isSessionModalOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-lg font-bold text-gray-900">เพิ่มเซสชันเวลา</h3>
          <button @click="isSessionModalOpen = false" class="text-gray-400 hover:text-gray-600">
            <i class="ph ph-x text-xl"></i>
          </button>
        </div>

        <div class="p-6 flex flex-col gap-5">
          <!-- Preset Quick Pick Buttons -->
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              เลือกเวลาจาก Preset ทันที:
            </label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="p in sessionPresets"
                :key="p.sessionName"
                type="button"
                @click="applySinglePreset(p)"
                :class="[
                  'px-3 py-2 text-xs font-semibold rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer',
                  sessionForm.sessionName === p.sessionName
                    ? 'bg-primary/10 border-primary text-primary font-bold ring-1 ring-primary/30'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                ]"
              >
                <span class="flex items-center gap-1 font-bold">
                  <i class="ph ph-clock text-sm"></i>
                  {{ p.sessionName }}
                </span>
                <span class="font-mono text-[11px] text-gray-500">
                  {{ p.startTime }} - {{ p.endTime }}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อ Session *</label>
            <select
              v-model="sessionForm.sessionName"
              @change="onSessionSelectChange"
              class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="Asia">Asia (07:00 - 12:00)</option>
              <option value="London">London (14:00 - 18:00)</option>
              <option value="New York">New York (19:00 - 22:00)</option>
              <option value="London Close">London Close (22:00 - 00:00)</option>
              <option value="Tokyo">Tokyo (07:00 - 13:00)</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">เวลาเริ่ม (HH:mm) *</label>
              <input
                v-model="sessionForm.startTime"
                type="time"
                class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">เวลาสิ้นสุด (HH:mm) *</label>
              <input
                v-model="sessionForm.endTime"
                type="time"
                class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        <div class="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
          <button
            @click="isSessionModalOpen = false"
            class="px-4 py-2.5 border border-gray-200 hover:bg-gray-100 rounded-xl font-semibold text-sm text-gray-600 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            @click="handleSaveSession"
            :disabled="!sessionForm.startTime || !sessionForm.endTime"
            class="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors"
          >
            เพิ่มเซสชัน
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Link Zone from Library -->
    <div
      v-if="isLinkZoneModalOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 class="text-lg font-bold text-gray-900">เลือก Zone จาก Library</h3>
            <p class="text-xs text-gray-500 mt-0.5">เลือกโซนเพื่อผูกเข้ากับ Setup ปัจจุบัน</p>
          </div>
          <button @click="isLinkZoneModalOpen = false" data-testid="close-link-zone-modal" class="text-gray-400 hover:text-gray-600">
            <i class="ph ph-x text-xl"></i>
          </button>
        </div>

        <div class="p-6 overflow-y-auto flex flex-col gap-3 flex-1">
          <div
            v-for="col in availableLibraryColumns"
            :key="col.id"
            class="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-primary/50 transition-colors"
          >
            <div>
              <div class="font-bold text-sm text-gray-900">{{ col.name }}</div>
              <div class="text-xs text-gray-500">{{ col.description || col.type }}</div>
            </div>
            <button
              @click="handleLinkColumn(col.id)"
              :data-testid="`link-col-btn-${col.id}`"
              class="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
            >
              Link Zone
            </button>
          </div>

          <div v-if="availableLibraryColumns.length === 0" class="text-center py-10 text-gray-400 text-sm">
            โซนทั้งหมดใน Library ถูกผูกกับ Setup นี้แล้ว หรือยังไม่มีโซนใน Library
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Add / Edit Master Column -->
    <div
      v-if="isMasterColumnModalOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-lg font-bold text-gray-900">
            {{ editingMasterColumnId ? 'แก้ไข Zone Definition' : 'สร้าง Zone Definition ใหม่' }}
          </h3>
          <button @click="isMasterColumnModalOpen = false" class="text-gray-400 hover:text-gray-600">
            <i class="ph ph-x text-xl"></i>
          </button>
        </div>

        <div class="p-6 flex flex-col gap-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อโซน (Zone Name) *</label>
            <input
              v-model="masterColumnForm.name"
              data-testid="zone-def-name-input"
              placeholder="เช่น Zone FVG M15 หรือ Zone Extreme OB"
              class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">ประเภท (Type)</label>
            <select
              v-model="masterColumnForm.type"
              class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="zone_group">Zone Group (มาตรฐาน: Bias, RR, SL, ตกรถ)</option>
              <option value="checkbox">Checkbox (ใช่/ไม่ใช่)</option>
              <option value="single_selector">Single Selector</option>
              <option value="string">Text</option>
              <option value="number">Number</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">คำอธิบาย</label>
            <textarea
              v-model="masterColumnForm.description"
              rows="3"
              placeholder="อธิบายลักษณะหรือเงื่อนไขของโซนนี้..."
              class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            ></textarea>
          </div>
        </div>

        <div class="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
          <button
            @click="isMasterColumnModalOpen = false"
            class="px-4 py-2.5 border border-gray-200 hover:bg-gray-100 rounded-xl font-semibold text-sm text-gray-600 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            @click="handleSaveMasterColumn"
            :disabled="!masterColumnForm.name.trim()"
            data-testid="save-zone-def-btn"
            class="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useResearchSettingsStore } from '../../stores/researchSettings'
import PlaybookFlowEditor from '../ui/PlaybookFlowEditor.vue'
import type { ResearchSetup, ResearchCustomColumn } from '../../../../shared/types'
import { DEFAULT_SESSION_PRESETS, STANDARD_SESSIONS, type SessionPreset } from '../../utils/sessions'

const settingsStore = useResearchSettingsStore()

const tabs = [
  { id: 'setups', label: 'Trading Setups', icon: 'ph ph-crosshair' },
  { id: 'symbols', label: 'Symbols', icon: 'ph ph-currency-circle-dollar' },
  { id: 'setup_sessions', label: 'Setup Sessions', icon: 'ph ph-clock' },
  { id: 'setup_playbooks', label: 'Setup Playbooks', icon: 'ph ph-book-open' },
  { id: 'custom_columns', label: 'Custom Columns', icon: 'ph ph-columns' }
]

const activeTab = ref('setups')
const newSymbolName = ref('')
const playbookMode = ref<'flow' | 'notes'>('flow')
const playbookNotesContent = ref('')

// Watch playbookContent in store to sync textarea
watch(
  () => settingsStore.activeSetupDetails.playbookContent,
  (val) => {
    playbookNotesContent.value = val || ''
  },
  { immediate: true }
)

// Setup Modal
const isSetupModalOpen = ref(false)
const editingSetupId = ref<number | null>(null)
const setupForm = ref({
  name: '',
  description: '',
  type: 'backtest',
  enableExitDate: false
})

const openAddSetupModal = () => {
  editingSetupId.value = null
  setupForm.value = {
    name: '',
    description: '',
    type: 'backtest',
    enableExitDate: false
  }
  isSetupModalOpen.value = true
}

const openEditSetupModal = (setup: ResearchSetup) => {
  editingSetupId.value = setup.id
  setupForm.value = {
    name: setup.name,
    description: setup.description || '',
    type: setup.type,
    enableExitDate: Boolean(setup.enableExitDate)
  }
  isSetupModalOpen.value = true
}

const handleSaveSetup = async () => {
  if (editingSetupId.value) {
    await settingsStore.updateSetup(editingSetupId.value, setupForm.value)
  } else {
    await settingsStore.createSetup(setupForm.value)
  }
  isSetupModalOpen.value = false
}

const confirmDeleteSetup = async (setup: ResearchSetup) => {
  if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ Setup "${setup.name}"? ข้อมูลเซสชันและเพลย์บุ๊กที่ผูกไว้จะถูกลบด้วย`)) {
    await settingsStore.deleteSetup(setup.id)
  }
}

// Symbols Handlers
const handleCreateSymbol = async () => {
  if (!newSymbolName.value.trim()) return
  const res = await settingsStore.addSymbol(newSymbolName.value)
  if (res.success) {
    newSymbolName.value = ''
  } else {
    alert(res.error || 'Failed to add symbol')
  }
}

const handleDeleteSymbol = async (id: number) => {
  if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบ Symbol นี้?')) {
    await settingsStore.deleteSymbol(id)
  }
}

// Session Modal & Presets
const sessionPresets = DEFAULT_SESSION_PRESETS
const isSessionModalOpen = ref(false)
const sessionForm = ref({
  sessionName: 'Asia',
  startTime: '07:00',
  endTime: '12:00'
})

const applySinglePreset = (p: SessionPreset) => {
  sessionForm.value = {
    sessionName: p.sessionName,
    startTime: p.startTime,
    endTime: p.endTime
  }
}

const onSessionSelectChange = () => {
  const match = STANDARD_SESSIONS.find((s) => s.value === sessionForm.value.sessionName)
  if (match) {
    sessionForm.value.startTime = match.defaultStart
    sessionForm.value.endTime = match.defaultEnd
  }
}

const openAddSessionModal = () => {
  const defaultPreset = sessionPresets[0]
  sessionForm.value = {
    sessionName: defaultPreset?.sessionName || 'Asia',
    startTime: defaultPreset?.startTime || '07:00',
    endTime: defaultPreset?.endTime || '12:00'
  }
  isSessionModalOpen.value = true
}

const isApplyingResearchPresets = ref(false)
const handleApplyStandardPresets = async () => {
  if (!settingsStore.selectedSetupId) return
  try {
    isApplyingResearchPresets.value = true
    for (const preset of DEFAULT_SESSION_PRESETS) {
      await settingsStore.addSession({
        sessionName: preset.sessionName,
        startTime: preset.startTime,
        endTime: preset.endTime
      })
    }
  } catch (err: any) {
    console.error('Failed to apply research session presets:', err)
    alert('เกิดข้อผิดพลาดในการโหลด Preset: ' + (err.message || String(err)))
  } finally {
    isApplyingResearchPresets.value = false
  }
}

const handleSaveSession = async () => {
  await settingsStore.addSession(sessionForm.value)
  isSessionModalOpen.value = false
}

const handleDeleteSession = async (id: number) => {
  await settingsStore.deleteSession(id)
}

// Playbook Handlers
const handleSavePlaybookNotes = async () => {
  const res = await settingsStore.savePlaybookContent(playbookNotesContent.value)
  if (res.success) {
    alert('บันทึก Playbook Notes สำเร็จ!')
  }
}

const handleSavePlaybookFlow = async (flowData: any) => {
  await settingsStore.savePlaybookFlow(flowData)
}

// Custom Columns Handlers
const isLinkZoneModalOpen = ref(false)
const openLinkZoneModal = () => {
  isLinkZoneModalOpen.value = true
}

const availableLibraryColumns = computed(() => {
  const linkedIds = new Set(
    settingsStore.activeSetupDetails.linkedCustomColumns.map((c) => c.id)
  )
  return settingsStore.libraryCustomColumns.filter((c) => !linkedIds.has(c.id))
})

const handleLinkColumn = async (columnId: number) => {
  await settingsStore.linkColumnToSetup(columnId)
  isLinkZoneModalOpen.value = false
}

const handleUnlinkColumn = async (columnId: number) => {
  await settingsStore.unlinkColumnFromSetup(columnId)
}

// Master Column Modal
const isMasterColumnModalOpen = ref(false)
const editingMasterColumnId = ref<number | null>(null)
const masterColumnForm = ref({
  name: '',
  type: 'zone_group',
  description: ''
})

const openAddMasterColumnModal = () => {
  editingMasterColumnId.value = null
  masterColumnForm.value = {
    name: '',
    type: 'zone_group',
    description: ''
  }
  isMasterColumnModalOpen.value = true
}

const openEditMasterColumnModal = (col: ResearchCustomColumn) => {
  editingMasterColumnId.value = col.id
  masterColumnForm.value = {
    name: col.name,
    type: col.type,
    description: col.description || ''
  }
  isMasterColumnModalOpen.value = true
}

const handleSaveMasterColumn = async () => {
  if (editingMasterColumnId.value) {
    await settingsStore.updateMasterColumn(editingMasterColumnId.value, masterColumnForm.value)
  } else {
    await settingsStore.createMasterColumn(masterColumnForm.value)
  }
  isMasterColumnModalOpen.value = false
}

const handleDeleteMasterColumn = async (id: number) => {
  if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบ Zone Definition นี้จาก Master Library?')) {
    await settingsStore.deleteMasterColumn(id)
  }
}

onMounted(async () => {
  await Promise.all([
    settingsStore.fetchSetups(),
    settingsStore.fetchSymbols(),
    settingsStore.fetchCustomColumnsLibrary()
  ])
})
</script>
