<template>
  <div class="p-8 w-full max-w-5xl mx-auto bg-gray-50/50 min-h-screen pb-24">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-1">New Journal Entry</h1>
        <p class="text-gray-500 text-sm">
          Log trade details or draft multiple setups simultaneously using tabs.
        </p>
      </div>

      <!-- Header Quick Actions -->
      <div class="flex items-center gap-2">
        <button
          v-if="tradeTabsStore.tabs.length > 1"
          type="button"
          @click="handleSaveAllTabs"
          :disabled="isSavingAll"
          class="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          title="Save all filled and unsaved tabs"
        >
          <svg
            v-if="!isSavingAll"
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
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span
            v-else
            class="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full"
          ></span>
          <span>Save All ({{ unsavedTabsCount }})</span>
        </button>

        <button
          type="button"
          @click="tradeTabsStore.addTab()"
          class="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
          title="Add a new trade tab"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>New Tab</span>
        </button>
      </div>
    </div>

    <!-- Tabs Navigation Bar -->
    <div class="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
      <div
        v-for="(tab, index) in tradeTabsStore.tabs"
        :key="tab.id"
        @click="tradeTabsStore.setActiveTab(tab.id)"
        :class="[
          'group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition-all whitespace-nowrap shadow-sm',
          tradeTabsStore.activeTabId === tab.id
            ? 'bg-white border-blue-500 text-blue-600 ring-2 ring-blue-500/10 shadow-md font-bold'
            : 'bg-white/80 border-gray-200 text-gray-600 hover:bg-white hover:text-gray-900'
        ]"
      >
        <!-- Saved indicator or dot -->
        <span
          v-if="tab.isSaved"
          class="flex items-center justify-center w-4 h-4 rounded-full bg-green-100 text-green-600"
          title="Saved successfully"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <span
          v-else-if="tradeTabsStore.hasTabData(tab)"
          class="w-2.5 h-2.5 rounded-full bg-blue-500"
          title="Draft has entries"
        ></span>
        <span
          v-else
          class="w-2.5 h-2.5 rounded-full bg-gray-300"
          title="Empty draft"
        ></span>

        <!-- Tab Title -->
        <span class="max-w-[170px] truncate">
          {{ tradeTabsStore.getTabDisplayTitle(tab, index) }}
        </span>

        <!-- Quick actions inside Tab -->
        <div class="flex items-center gap-0.5 ml-1">
          <!-- Duplicate Button -->
          <button
            type="button"
            @click.stop="tradeTabsStore.duplicateTab(tab.id)"
            class="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Duplicate this trade setup to a new tab"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          </button>

          <!-- Close / Reset Button -->
          <button
            type="button"
            @click.stop="handleRequestCloseTab(tab)"
            class="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            :title="tradeTabsStore.tabs.length > 1 ? 'Close tab' : 'Reset tab'"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Add New Tab Pill -->
      <button
        type="button"
        @click="tradeTabsStore.addTab()"
        class="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-dashed border-gray-300 text-gray-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 text-sm font-semibold transition-all whitespace-nowrap bg-white/40"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>New Trade</span>
      </button>
    </div>

    <!-- Active Tab Saved Notice -->
    <div
      v-if="tradeTabsStore.activeTab.isSaved"
      class="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between text-green-800 text-sm font-medium"
    >
      <div class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-green-600"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>This trade entry has been saved successfully!</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="tradeTabsStore.resetTab(tradeTabsStore.activeTab.id)"
          class="text-xs font-bold px-3 py-1.5 bg-white border border-green-300 rounded-lg hover:bg-green-100 transition-colors"
        >
          Start New Entry in This Tab
        </button>
        <button
          v-if="tradeTabsStore.tabs.length > 1"
          type="button"
          @click="tradeTabsStore.closeTab(tradeTabsStore.activeTab.id)"
          class="text-xs font-bold px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Close Tab
        </button>
      </div>
    </div>

    <form @submit.prevent="saveEntry" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Core Data -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Basic Info Card -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2
            class="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2"
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
              class="text-blue-500"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Trade Info
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Setup Selection -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Setup</label>
              <BaseSelect
                v-model="form.setupId"
                :options="setups.map((s) => ({ label: s.name, value: s.id }))"
                placeholder="Select a Setup"
              />
            </div>

            <!-- Symbol -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Symbol</label>
              <BaseSelect
                v-model="form.symbolId"
                :options="symbols.map((s) => ({ label: s.name, value: s.id }))"
                placeholder="Select a Symbol"
              />
            </div>

            <!-- Position -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Position</label>
              <div class="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                <button
                  type="button"
                  @click="form.position = 'Buy'"
                  :class="[
                    'flex-1 py-1.5 text-sm font-bold rounded-lg',
                    form.position === 'Buy'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-500 hover:text-gray-900'
                  ]"
                >
                  Buy
                </button>
                <button
                  type="button"
                  @click="form.position = 'Sell'"
                  :class="[
                    'flex-1 py-1.5 text-sm font-bold rounded-lg',
                    form.position === 'Sell'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-500 hover:text-gray-900'
                  ]"
                >
                  Sell
                </button>
              </div>
            </div>

            <!-- Direction Bias -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Bias</label>
              <div class="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                <button
                  type="button"
                  @click="form.directionBias = 'Bullish'"
                  :class="[
                    'flex-1 py-1.5 text-sm font-bold rounded-lg',
                    form.directionBias === 'Bullish'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-500 hover:text-gray-900'
                  ]"
                >
                  Bullish
                </button>
                <button
                  type="button"
                  @click="form.directionBias = 'Bearish'"
                  :class="[
                    'flex-1 py-1.5 text-sm font-bold rounded-lg',
                    form.directionBias === 'Bearish'
                      ? 'bg-white shadow-sm text-red-600'
                      : 'text-gray-500 hover:text-gray-900'
                  ]"
                >
                  Bearish
                </button>
              </div>
            </div>

            <!-- Entry Timeframe -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Timeframe</label>
              <BaseSelect
                v-model="form.entryTimeframe"
                :options="['M1', 'M5', 'M15', 'H1', 'H4', 'D1']"
                placeholder="Select Timeframe"
              />
            </div>
          </div>
        </div>

        <!-- Date & Time -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2
            class="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2"
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
              class="text-purple-500"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Timing
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5"
                >Entry Date & Time</label
              >
              <BaseDateInput v-model="form.entryDatetime" :withTime="true" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5"
                >Exit Date & Time</label
              >
              <BaseDateInput v-model="form.exitDatetime" :withTime="true" />
            </div>
          </div>

          <div class="pt-5 border-t border-gray-50">
            <!-- Session -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Session</label>
              <BaseSelect
                v-model="form.sessionName"
                :options="setupSessions.map((s) => ({ label: s.sessionName, value: s.sessionName }))"
                placeholder="Select Session"
                :disabled="setupSessions.length === 0"
              />
              <p
                v-if="setupSessions.length === 0 && form.setupId"
                class="text-xs text-orange-500 mt-1 font-medium"
              >
                No sessions defined for this setup.
              </p>
            </div>
          </div>
        </div>

        <!-- RR Data -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
            <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
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
                class="text-green-500"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
              Risk / Reward Results
            </h2>
          </div>

          <div class="space-y-6">
            <!-- Normal RR -->
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h3 class="text-sm font-bold text-gray-800 mb-3">1. Normal RR</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">SL Points</label>
                  <input
                    type="number"
                    step="any"
                    v-model="form.normalSlPoints"
                    class="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg p-2 font-bold outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">RR</label>
                  <input
                    type="number"
                    step="any"
                    v-model="form.normalRr"
                    class="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg p-2 font-bold outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Max RR</label>
                  <input
                    type="number"
                    step="any"
                    v-model="form.normalMaxRr"
                    class="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg p-2 font-bold outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1"
                    >TP Points (Auto)</label
                  >
                  <div
                    class="w-full bg-gray-100 border border-gray-200 text-gray-500 text-sm rounded-lg p-2 font-bold"
                  >
                    {{
                      form.normalRr && form.normalSlPoints
                        ? (form.normalRr * form.normalSlPoints).toFixed(2)
                        : '0.00'
                    }}
                  </div>
                </div>
              </div>
            </div>

            <!-- BE RR -->
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h3 class="text-sm font-bold text-gray-800 mb-3">2. Break Even (BE) RR</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">SL Points</label>
                  <input
                    type="number"
                    step="any"
                    v-model="form.beSlPoints"
                    class="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg p-2 font-bold outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">RR</label>
                  <input
                    type="number"
                    step="any"
                    v-model="form.beRr"
                    class="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg p-2 font-bold outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Max RR</label>
                  <input
                    type="number"
                    step="any"
                    v-model="form.beMaxRr"
                    class="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg p-2 font-bold outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1"
                    >TP Points (Auto)</label
                  >
                  <div
                    class="w-full bg-gray-100 border border-gray-200 text-gray-500 text-sm rounded-lg p-2 font-bold"
                  >
                    {{
                      form.beRr && form.beSlPoints
                        ? (form.beRr * form.beSlPoints).toFixed(2)
                        : '0.00'
                    }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Trail RR -->
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h3 class="text-sm font-bold text-gray-800 mb-3">3. Trail + BE RR</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">SL Points</label>
                  <input
                    type="number"
                    step="any"
                    v-model="form.trailSlPoints"
                    class="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg p-2 font-bold outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">RR</label>
                  <input
                    type="number"
                    step="any"
                    v-model="form.trailRr"
                    class="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg p-2 font-bold outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Max RR</label>
                  <input
                    type="number"
                    step="any"
                    v-model="form.trailMaxRr"
                    class="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg p-2 font-bold outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 mb-1"
                    >TP Points (Auto)</label
                  >
                  <div
                    class="w-full bg-gray-100 border border-gray-200 text-gray-500 text-sm rounded-lg p-2 font-bold"
                  >
                    {{
                      form.trailRr && form.trailSlPoints
                        ? (form.trailRr * form.trailSlPoints).toFixed(2)
                        : '0.00'
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Custom Fields -->
        <div
          v-if="customColumns.length > 0"
          class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <div class="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
            <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
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
                class="text-indigo-500"
              >
                <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path
                  d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"
                />
              </svg>
              Custom Fields
            </h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div v-for="col in customColumns" :key="col.id">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">{{ col.name }}</label>
              <input
                v-if="col.type === 'string'"
                type="text"
                v-model="customData[col.id]"
                class="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <input
                v-else-if="col.type === 'number'"
                type="number"
                step="0.1"
                v-model="customData[col.id]"
                class="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <div v-else-if="col.type === 'checkbox'" class="flex items-center mt-2">
                <input
                  type="checkbox"
                  v-model="customData[col.id]"
                  class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div v-else-if="col.type === 'switch'" class="flex items-center mt-2">
                <label class="flex items-center cursor-pointer relative">
                  <input type="checkbox" class="sr-only" v-model="customData[col.id]" />
                  <div
                    class="w-10 h-5 rounded-full transition-colors"
                    :class="customData[col.id] ? 'bg-blue-600' : 'bg-gray-300'"
                  ></div>
                  <div
                    class="absolute left-[3px] top-[3px] w-3.5 h-3.5 bg-white rounded-full transition-all"
                    :class="customData[col.id] ? 'translate-x-[19px]' : 'translate-x-0'"
                  ></div>
                </label>
              </div>
              <BaseSelect
                v-else-if="col.type === 'single_selector'"
                v-model="customData[col.id]"
                :options="col.options ? col.options.map((o: any) => ({ label: o, value: o })) : []"
                placeholder="Select an option"
              />
              <BaseMultiSelect
                v-else-if="col.type === 'multiple_selector'"
                v-model="customData[col.id]"
                :options="col.options ? col.options.map((o: any) => ({ label: o, value: o })) : []"
                placeholder="Select options..."
              />
              <input
                v-else
                type="text"
                v-model="customData[col.id]"
                class="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Meta & Details -->
      <div class="space-y-6">
        <!-- Quality & Flags -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 class="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
            Attributes
          </h2>

          <div class="space-y-5">
            <!-- Quality -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Trade Quality</label>
              <div class="flex gap-2">
                <button
                  type="button"
                  @click="form.quality = 'Green'"
                  :class="[
                    'w-8 h-8 rounded-full bg-green-500 transition-all',
                    form.quality === 'Green'
                      ? 'shadow-sm ring-2 ring-offset-2 ring-green-500'
                      : 'opacity-40 hover:opacity-100'
                  ]"
                ></button>
                <button
                  type="button"
                  @click="form.quality = 'Blue'"
                  :class="[
                    'w-8 h-8 rounded-full bg-blue-500 transition-all',
                    form.quality === 'Blue'
                      ? 'shadow-sm ring-2 ring-offset-2 ring-blue-500'
                      : 'opacity-40 hover:opacity-100'
                  ]"
                ></button>
                <button
                  type="button"
                  @click="form.quality = 'Yellow'"
                  :class="[
                    'w-8 h-8 rounded-full bg-yellow-400 transition-all',
                    form.quality === 'Yellow'
                      ? 'shadow-sm ring-2 ring-offset-2 ring-yellow-400'
                      : 'opacity-40 hover:opacity-100'
                  ]"
                ></button>
                <button
                  type="button"
                  @click="form.quality = 'Orange'"
                  :class="[
                    'w-8 h-8 rounded-full bg-orange-500 transition-all',
                    form.quality === 'Orange'
                      ? 'shadow-sm ring-2 ring-offset-2 ring-orange-500'
                      : 'opacity-40 hover:opacity-100'
                  ]"
                ></button>
                <button
                  type="button"
                  @click="form.quality = 'Red'"
                  :class="[
                    'w-8 h-8 rounded-full bg-red-500 transition-all',
                    form.quality === 'Red'
                      ? 'shadow-sm ring-2 ring-offset-2 ring-red-500'
                      : 'opacity-40 hover:opacity-100'
                  ]"
                ></button>
              </div>
            </div>

            <!-- Flags -->
            <div class="flex flex-col gap-3 mt-2">
              <label class="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  v-model="form.news"
                  class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm font-semibold text-gray-700 group-hover:text-gray-900"
                  >News Impacted</span
                >
              </label>
              <label class="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  v-model="form.isTest"
                  class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm font-semibold text-gray-700 group-hover:text-gray-900"
                  >Test / Paper Trade</span
                >
              </label>
            </div>
          </div>
        </div>

        <!-- Images -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2
            class="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2"
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
              class="text-pink-500"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            Screenshots (URLs)
          </h2>
          <div class="space-y-3">
            <div v-for="(_, index) in imageUrls" :key="index" class="flex gap-2">
              <input
                type="url"
                v-model="imageUrls[index]"
                placeholder="https://..."
                class="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                @click="removeImageUrl(index)"
                class="w-10 h-10 flex flex-shrink-0 items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              @click="addImageUrl"
              class="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add another image URL
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2
            class="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2"
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
              class="text-amber-500"
            >
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
              <circle cx="11" cy="11" r="2" />
            </svg>
            Notes & Learnings
          </h2>
          <textarea
            v-model="form.notes"
            class="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y min-h-[150px]"
            placeholder="What went well? What could be improved?"
          ></textarea>
        </div>
      </div>

      <!-- Bottom Save Action Bar -->
      <div
        class="lg:col-span-3 mt-4 pt-6 border-t border-gray-200 flex flex-wrap justify-between items-center gap-3"
      >
        <div class="flex items-center gap-2">
          <button
            v-if="tradeTabsStore.tabs.length > 1"
            type="button"
            @click="handleRequestCloseTab(tradeTabsStore.activeTab)"
            class="px-4 py-3 rounded-xl font-bold text-sm text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            Close This Tab
          </button>
          <button
            type="button"
            @click="tradeTabsStore.duplicateTab(tradeTabsStore.activeTab.id)"
            class="px-4 py-3 rounded-xl font-bold text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            Duplicate Tab
          </button>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="tradeTabsStore.resetTab(tradeTabsStore.activeTab.id)"
            class="px-6 py-3 rounded-xl font-bold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
          >
            Reset Tab
          </button>

          <button
            v-if="tradeTabsStore.tabs.length > 1"
            type="button"
            @click="handleSaveAllTabs"
            :disabled="isSavingAll"
            class="px-6 py-3 rounded-xl font-bold text-sm text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <svg
              v-if="!isSavingAll"
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span
              v-else
              class="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
            ></span>
            Save All Tabs
          </button>

          <button
            type="submit"
            :disabled="tradeTabsStore.activeTab.isSaving"
            class="px-6 py-3 rounded-xl font-bold text-sm text-white bg-gray-900 hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <svg
              v-if="!tradeTabsStore.activeTab.isSaving"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span
              v-else
              class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            ></span>
            {{ tradeTabsStore.activeTab.isSaving ? 'Saving...' : 'Save Entry' }}
          </button>
        </div>
      </div>
    </form>

    <!-- Confirm Discard / Close Modal -->
    <div
      v-if="confirmCloseDialog.isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100">
        <div
          class="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Close this tab?</h3>
        <p class="text-sm text-gray-600 mb-6">
          "{{ confirmCloseDialog.tabTitle }}" contains unsaved trade information. Are you sure you
          want to discard it?
        </p>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            @click="confirmCloseDialog.isOpen = false"
            class="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="confirmCloseTab"
            class="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
          >
            Discard & Close
          </button>
        </div>
      </div>
    </div>

    <!-- Alert Modal (Toast) -->
    <BaseAlertDialog
      :is-open="alertModal.isOpen"
      :title="alertModal.title"
      :message="alertModal.message"
      :variant="alertModal.variant"
      :duration="alertModal.duration"
      @close="alertModal.isOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import BaseDateInput from '../ui/BaseDateInput.vue'
import BaseSelect from '../ui/BaseSelect.vue'
import BaseMultiSelect from '../ui/BaseMultiSelect.vue'
import BaseAlertDialog from '../ui/BaseAlertDialog.vue'
import { useTradeTabsStore, TradeTab } from '../../stores/tradeTabs'

const tradeTabsStore = useTradeTabsStore()

// Bind reactive form references to active tab
const form = computed(() => tradeTabsStore.activeTab.form)
const imageUrls = computed(() => tradeTabsStore.activeTab.imageUrls)
const customColumns = computed(() => tradeTabsStore.activeTab.customColumns)
const customData = computed(() => tradeTabsStore.activeTab.customData)
const setupSessions = computed(() => tradeTabsStore.activeTab.setupSessions)
const setups = computed(() => tradeTabsStore.setups)
const symbols = computed(() => tradeTabsStore.symbols)

const unsavedTabsCount = computed(() => {
  return tradeTabsStore.tabs.filter((t) => tradeTabsStore.hasTabData(t) && !t.isSaved).length
})

// Watch entryDatetime on active tab for auto session matching
watch(
  () => [tradeTabsStore.activeTab.id, form.value?.entryDatetime] as const,
  ([currentTabId, currentDatetime], [oldTabId, oldDatetime]) => {
    if (currentTabId !== oldTabId) return
    if (currentDatetime && currentDatetime !== oldDatetime) {
      tradeTabsStore.onEntryDatetimeChange(currentTabId, currentDatetime)
    }
  }
)

// Watch normalSlPoints for auto-propagating to BE and Trail if empty
watch(
  () => [tradeTabsStore.activeTab.id, form.value?.normalSlPoints] as const,
  ([currentTabId, currentSl], [oldTabId, oldSl]) => {
    if (currentTabId !== oldTabId) return
    if (
      currentSl !== null &&
      currentSl !== undefined &&
      (currentSl as any) !== '' &&
      currentSl !== oldSl
    ) {
      if (
        form.value.beSlPoints === null ||
        form.value.beSlPoints === undefined ||
        (form.value.beSlPoints as any) === ''
      ) {
        form.value.beSlPoints = currentSl
      }
      if (
        form.value.trailSlPoints === null ||
        form.value.trailSlPoints === undefined ||
        (form.value.trailSlPoints as any) === ''
      ) {
        form.value.trailSlPoints = currentSl
      }
    }
  }
)

// Watch setupId change to fetch custom columns and sessions
watch(
  () => [tradeTabsStore.activeTab.id, form.value?.setupId] as const,
  async ([currentTabId, currentSetupId], [oldTabId, oldSetupId]) => {
    if (currentTabId !== oldTabId) {
      // Switching tabs: if newly active tab has setupId and no custom columns loaded, fetch them
      if (currentSetupId && tradeTabsStore.activeTab.customColumns.length === 0) {
        await tradeTabsStore.onSetupChange(currentTabId, currentSetupId)
      }
      return
    }

    if (currentSetupId !== oldSetupId) {
      await tradeTabsStore.onSetupChange(currentTabId, currentSetupId)
    }
  }
)

onMounted(async () => {
  await tradeTabsStore.loadMetadata()
  if (tradeTabsStore.activeTab.form.setupId && tradeTabsStore.activeTab.customColumns.length === 0) {
    await tradeTabsStore.onSetupChange(
      tradeTabsStore.activeTab.id,
      tradeTabsStore.activeTab.form.setupId
    )
  }
})

const addImageUrl = () => {
  tradeTabsStore.activeTab.imageUrls.push('')
}

const removeImageUrl = (index: number) => {
  tradeTabsStore.activeTab.imageUrls.splice(index, 1)
  if (tradeTabsStore.activeTab.imageUrls.length === 0) {
    tradeTabsStore.activeTab.imageUrls.push('')
  }
}

// Confirmation Dialog for Discarding / Closing a tab
const confirmCloseDialog = ref({
  isOpen: false,
  tabId: '',
  tabTitle: ''
})

const handleRequestCloseTab = (tab: TradeTab) => {
  const index = tradeTabsStore.tabs.findIndex((t) => t.id === tab.id)
  const tabTitle = tradeTabsStore.getTabDisplayTitle(tab, Math.max(0, index))

  if (tradeTabsStore.tabs.length === 1) {
    if (tradeTabsStore.hasTabData(tab) && !tab.isSaved) {
      confirmCloseDialog.value = {
        isOpen: true,
        tabId: tab.id,
        tabTitle
      }
    } else {
      tradeTabsStore.resetTab(tab.id)
    }
    return
  }

  if (tradeTabsStore.hasTabData(tab) && !tab.isSaved) {
    confirmCloseDialog.value = {
      isOpen: true,
      tabId: tab.id,
      tabTitle
    }
  } else {
    tradeTabsStore.closeTab(tab.id)
  }
}

const confirmCloseTab = () => {
  if (confirmCloseDialog.value.tabId) {
    tradeTabsStore.closeTab(confirmCloseDialog.value.tabId)
  }
  confirmCloseDialog.value.isOpen = false
}

// Alert Toast State
const alertModal = ref({
  isOpen: false,
  title: '',
  message: '',
  variant: 'success' as 'success' | 'error' | 'info',
  duration: 3500
})

const showAlert = (
  title: string,
  message: string,
  variant: 'success' | 'error' | 'info' = 'success',
  duration = 3500
) => {
  alertModal.value = {
    isOpen: true,
    title,
    message,
    variant,
    duration
  }
}

const saveEntry = async () => {
  const tab = tradeTabsStore.activeTab
  const res = await tradeTabsStore.saveTab(tab.id)
  if (res.success) {
    showAlert('Success', 'Entry saved successfully!', 'success')
  } else {
    showAlert('Error', res.error || 'Failed to save entry', 'error')
  }
}

const isSavingAll = ref(false)
const handleSaveAllTabs = async () => {
  if (isSavingAll.value) return
  isSavingAll.value = true
  try {
    const res = await tradeTabsStore.saveAllTabs()
    if (res.succeeded > 0 && res.failed === 0) {
      showAlert('Success', `All ${res.succeeded} trade entries saved successfully!`, 'success')
    } else if (res.succeeded > 0 && res.failed > 0) {
      showAlert(
        'Warning',
        `Saved ${res.succeeded} entries, but ${res.failed} failed:\n${res.errors.join('\n')}`,
        'error',
        6000
      )
    } else if (res.failed > 0) {
      showAlert('Error', `Failed to save entries:\n${res.errors.join('\n')}`, 'error', 5000)
    } else {
      showAlert('Info', res.errors[0] || 'No unsaved trade tabs with data found', 'info')
    }
  } catch (err: any) {
    showAlert('Error', err.message || 'Error occurred while saving all entries', 'error')
  } finally {
    isSavingAll.value = false
  }
}
</script>
