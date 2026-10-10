<template>
  <div class="p-8 w-full max-w-5xl mx-auto bg-gray-50/50 min-h-screen pb-24">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-1">New Journal Entry</h1>
        <p class="text-gray-500 text-sm">Log your latest trade details.</p>
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

            <!-- Session -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Session</label>
              <BaseSelect
                v-model="form.sessionName"
                :options="setupSessions.map(s => ({ label: s.sessionName, value: s.sessionName }))"
                placeholder="Select Session"
                :disabled="setupSessions.length === 0"
              />
              <p v-if="setupSessions.length === 0 && form.setupId" class="text-xs text-orange-500 mt-1 font-medium">No sessions defined for this setup.</p>
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
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    required
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
                    required
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
                    required
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
                    required
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
                    required
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
                    required
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
                    required
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
                    required
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
                    required
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
              <div
                v-else-if="col.type === 'checkbox'"
                class="flex items-center mt-2"
              >
                <input
                  type="checkbox"
                  v-model="customData[col.id]"
                  class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div
                v-else-if="col.type === 'switch'"
                class="flex items-center mt-2"
              >
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
                :options="col.options ? col.options.map(o => ({ label: o, value: o })) : []"
                placeholder="Select an option"
              />
              <BaseMultiSelect
                v-else-if="col.type === 'multiple_selector'"
                v-model="customData[col.id]"
                :options="col.options ? col.options.map(o => ({ label: o, value: o })) : []"
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

      <!-- Bottom Save Action -->
      <div class="lg:col-span-3 mt-4 pt-6 border-t border-gray-200 flex justify-end gap-3">
        <button
          type="button"
          @click="resetForm"
          class="px-6 py-3 rounded-xl font-bold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
        >
          Cancel / Reset
        </button>
        <button
          type="submit"
          :disabled="isSaving"
          class="px-6 py-3 rounded-xl font-bold text-sm text-white bg-gray-900 hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          <svg
            v-if="!isSaving"
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
          {{ isSaving ? 'Saving...' : 'Save Entry' }}
        </button>
      </div>
    </form>

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
import { ref, onMounted, watch } from 'vue'
import BaseDateInput from '../ui/BaseDateInput.vue'
import BaseSelect from '../ui/BaseSelect.vue'
import BaseMultiSelect from '../ui/BaseMultiSelect.vue'
import BaseAlertDialog from '../ui/BaseAlertDialog.vue'

const setups = ref<{ id: number; name: string }[]>([])
const symbols = ref<{ id: number; name: string }[]>([])
const isSaving = ref(false)
const customColumns = ref<any[]>([])
const customData = ref<Record<string, any>>({})

const getInitialForm = () => ({
  setupId: '' as number | '',
  symbolId: '' as number | '',
  position: 'Buy' as 'Buy' | 'Sell',
  directionBias: 'Bullish' as 'Bullish' | 'Bearish',
  entryTimeframe: 'M15',
  sessionName: 'New York',
  entryDatetime: '',
  exitDatetime: '',
  quality: 'Green' as 'Green' | 'Blue' | 'Yellow' | 'Orange' | 'Red',
  news: false,
  isTest: false,
  notes: '',

  normalRr: null as number | null,
  normalMaxRr: null as number | null,
  normalSlPoints: null as number | null,

  beRr: null as number | null,
  beMaxRr: null as number | null,
  beSlPoints: null as number | null,

  trailRr: null as number | null,
  trailMaxRr: null as number | null,
  trailSlPoints: null as number | null
})

const form = ref(getInitialForm())
const imageUrls = ref<string[]>([''])

const setupSessions = ref<any[]>([])

watch(
  () => form.value.setupId,
  async (newSetupId) => {
    if (!newSetupId) {
      customColumns.value = []
      customData.value = {}
      setupSessions.value = []
      return
    }
    try {
      const res = await window.api.setups.getDetails(newSetupId)
      if (res.success) {
        customColumns.value = res.data.customColumns || []
        setupSessions.value = res.data.sessions || []
        
        const newData: Record<string, any> = {}
        if (res.data.customColumns) {
          res.data.customColumns.forEach((col: any) => {
            if (col.type === 'switch' || col.type === 'checkbox') newData[col.id] = false
            else if (col.type === 'number') newData[col.id] = null
            else if (col.type === 'multiple_selector') newData[col.id] = []
            else newData[col.id] = ''
          })
        }
        customData.value = newData
        form.value.sessionName = ''
      }
    } catch (e) {
      console.error('Failed to load custom columns', e)
    }
  }
)

onMounted(async () => {
  try {
    const [setupsRes, symbolsRes] = await Promise.all([
      window.api.setups.list(),
      window.api.symbols.list()
    ])
    if (setupsRes.success) setups.value = setupsRes.data
    if (symbolsRes.success) symbols.value = symbolsRes.data
  } catch (error) {
    console.error('Failed to load setups/symbols:', error)
  }
})

const addImageUrl = () => {
  imageUrls.value.push('')
}

const removeImageUrl = (index: number) => {
  imageUrls.value.splice(index, 1)
  if (imageUrls.value.length === 0) {
    imageUrls.value.push('')
  }
}

const resetForm = () => {
  form.value = getInitialForm()
  imageUrls.value = ['']
}

// Alert Modal State
const alertModal = ref({
  isOpen: false,
  title: '',
  message: '',
  variant: 'success' as 'success' | 'error' | 'info',
  duration: 3000
})

const showAlert = (title: string, message: string, variant: 'success' | 'error' | 'info' = 'success', duration = 3000) => {
  alertModal.value = {
    isOpen: true,
    title,
    message,
    variant,
    duration
  }
}

const saveEntry = async () => {
  if (isSaving.value) return

  if (!form.value.entryDatetime) {
    showAlert('Error', 'Entry Date & Time is required', 'error')
    return
  }
  if (!form.value.setupId) {
    showAlert('Error', 'Trading Setup is required', 'error')
    return
  }
  if (!form.value.symbolId) {
    showAlert('Error', 'Symbol is required', 'error')
    return
  }

  isSaving.value = true

  try {
    const validImages = imageUrls.value.filter((url) => url.trim().length > 0)

    const entryData = {
      ...form.value,
      setupId: Number(form.value.setupId),
      symbolId: Number(form.value.symbolId),
      exitDatetime: form.value.exitDatetime || null,
      sessionName: form.value.sessionName || null,

      // Calculate TPs automatically based on the view logic
      normalTpPoints:
        form.value.normalRr && form.value.normalSlPoints
          ? Number((form.value.normalRr * form.value.normalSlPoints).toFixed(2))
          : null,
      beTpPoints:
        form.value.beRr && form.value.beSlPoints
          ? Number((form.value.beRr * form.value.beSlPoints).toFixed(2))
          : null,
      trailTpPoints:
        form.value.trailRr && form.value.trailSlPoints
          ? Number((form.value.trailRr * form.value.trailSlPoints).toFixed(2))
          : null,

      images: validImages.length > 0 ? validImages : null,
      customData: Object.keys(customData.value).length > 0 ? customData.value : null
    }

    const res = await window.api.journal.create(entryData)
    
    if (res.success) {
      showAlert('Success', 'Entry saved successfully!', 'success')
      resetForm()
    } else {
      console.error('Failed to save entry:', res.error)
      showAlert('Error', 'Failed to save entry: ' + res.error, 'error')
    }
  } catch (error: any) {
    console.error('Failed to save entry:', error)
    showAlert('Error', 'Failed to save entry: ' + (error.message || String(error)), 'error')
  } finally {
    isSaving.value = false
  }
}
</script>
