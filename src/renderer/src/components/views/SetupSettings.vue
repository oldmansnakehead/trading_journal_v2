<template>
  <div class="p-8 w-full max-w-6xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
      <p class="text-gray-500 text-sm">Manage your setups, symbols, and journal configurations.</p>
    </div>

    <!-- Tabs -->
    <div class="flex overflow-x-auto no-scrollbar border-b border-gray-200 mb-8 gap-8">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'flex items-center gap-2 py-4 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors',
          activeTab === tab.id
            ? 'border-gray-900 text-gray-900'
            : 'border-transparent text-gray-500 hover:text-gray-900'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px]">
      <!-- Setups Tab -->
      <div v-if="activeTab === 'setups'" class="flex flex-col gap-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Trading Setups</h2>
            <p class="text-sm text-gray-500 mt-1">
              Define your trading strategies, sessions, and playbooks.
            </p>
          </div>
          <button
            @click="openAddSetupModal"
            class="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
          >
            <svg
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
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Add Setup
          </button>
        </div>

        <!-- Setup List -->
        <div v-if="setups.length === 0" class="text-center py-10 border border-dashed border-gray-300 rounded-xl">
          <p class="text-gray-500 font-medium">No setups found. Create your first trading setup!</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <div
            v-for="setup in setups"
            :key="setup.id"
            class="border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div class="flex justify-between items-start mb-3">
                <h3
                  class="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors"
                >
                  {{ setup.name }}
                </h3>
                <span 
                  class="px-2 py-1 text-xs font-bold rounded-md capitalize"
                  :class="setup.type === 'real' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'"
                >
                  {{ setup.type }}
                </span>
              </div>
              <p class="text-sm text-gray-500 mb-4 line-clamp-2">
                {{ setup.description || 'No description provided.' }}
              </p>
            </div>

            <!-- TODO: Replace with real session/playbook count later -->
            <div class="flex items-center gap-4 text-xs font-semibold text-gray-400">
              <div class="flex items-center gap-1">
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
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                  <path d="M8 14h.01" />
                  <path d="M12 14h.01" />
                  <path d="M16 14h.01" />
                  <path d="M8 18h.01" />
                  <path d="M12 18h.01" />
                  <path d="M16 18h.01" />
                </svg>
                0 Sessions
              </div>
              <div class="flex items-center gap-1">
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
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                0 Playbooks
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Symbols Tab -->
      <div v-else-if="activeTab === 'symbols'" class="flex flex-col gap-6 max-w-2xl">
        <div class="flex justify-between items-center mb-2">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Trading Symbols</h2>
            <p class="text-sm text-gray-500 mt-1">
              Manage the assets you trade (e.g. XAUUSD, EURUSD).
            </p>
          </div>
        </div>

        <form @submit.prevent="addSymbol" class="flex gap-3">
          <BaseInput
            id="new-symbol"
            v-model="newSymbol"
            placeholder="Enter new symbol..."
            class="flex-1"
          />
          <BaseButton type="submit" variant="primary" :disabled="!newSymbol.trim()">
            Add Symbol
          </BaseButton>
        </form>

        <div v-if="symbols.length === 0" class="text-center py-8 border border-dashed border-gray-300 rounded-xl mt-4">
          <p class="text-gray-500 font-medium">No symbols found. Add your first trading symbol!</p>
        </div>
        <div v-else class="flex flex-wrap gap-3 mt-2">
          <div
            v-for="sym in symbols"
            :key="sym.id"
            class="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
          >
            {{ sym.name }}
            <button 
              @click="deleteSymbol(sym.id)"
              class="text-gray-400 hover:text-red-500 ml-1 transition-colors"
              title="Delete symbol"
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
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Setup Sessions Tab -->
      <div v-else-if="activeTab === 'setup_sessions'" class="flex flex-col gap-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Setup Sessions</h2>
            <p class="text-sm text-gray-500 mt-1">Manage trading timetables for each setup.</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-48">
              <BaseSelect
                id="session-setup-select"
                v-model="selectedSetupId"
                :options="setupOptions"
                placeholder="Select Setup"
              />
            </div>
            <button
              v-if="selectedSessions.length > 0"
              @click="deleteSelectedSessions"
              class="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm border border-red-200"
            >
              Delete Selected ({{ selectedSessions.length }})
            </button>
            <button
              @click="openAddSessionModal"
              :disabled="!selectedSetupId"
              class="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              <svg
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
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add Session
            </button>
          </div>
        </div>

        <div v-if="!selectedSetupId" class="text-center py-8 border border-dashed border-gray-300 rounded-xl mt-4">
          <p class="text-gray-500 font-medium">Please select a Setup first to manage its sessions.</p>
        </div>
        <div v-else-if="setupSessionsList.length === 0" class="text-center py-8 border border-dashed border-gray-300 rounded-xl mt-4">
          <p class="text-gray-500 font-medium">No sessions found for this setup.</p>
        </div>
        <div v-else class="overflow-x-auto mt-4 rounded-xl border border-gray-200">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr
                class="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider"
              >
                <th class="py-3 px-4 w-12 text-center">
                  <input type="checkbox" :checked="selectedSessions.length === setupSessionsList.length && setupSessionsList.length > 0" @change="toggleAllSessions" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th class="py-3 px-4">Session Name</th>
                <th class="py-3 px-4">Start Time</th>
                <th class="py-3 px-4">End Time</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                class="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                v-for="session in setupSessionsList"
                :key="session.id"
              >
                <td class="py-4 px-4 text-center">
                  <input type="checkbox" :value="session.id" v-model="selectedSessions" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </td>
                <td class="py-4 px-4 font-semibold text-sm text-gray-900">{{ session.sessionName }}</td>
                <td class="py-4 px-4 text-sm text-gray-600">{{ session.startTime }}</td>
                <td class="py-4 px-4 text-sm text-gray-600">{{ session.endTime }}</td>
                <td class="py-4 px-4 text-right">
                  <button @click="deleteSession(session.id)" class="text-red-500 hover:text-red-700 font-semibold text-sm ml-3">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Setup Playbooks Tab -->
      <div v-else-if="activeTab === 'setup_playbooks'" class="flex flex-col gap-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Setup Playbooks</h2>
            <p class="text-sm text-gray-500 mt-1">Write down your hypothesis, rules, and conditions for each setup.</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-48">
              <BaseSelect
                id="playbook-setup-select"
                v-model="selectedSetupId"
                :options="setupOptions"
                placeholder="Select Setup"
              />
            </div>
            <button
              @click="savePlaybook"
              :disabled="!selectedSetupId || !playbookContentModified"
              class="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Save Playbook
            </button>
          </div>
        </div>

        <div v-if="!selectedSetupId" class="text-center py-8 border border-dashed border-gray-300 rounded-xl mt-4">
          <p class="text-gray-500 font-medium">Please select a Setup first to edit its playbook.</p>
        </div>
        <div v-else class="flex flex-col gap-2 h-[400px]">
          <textarea
            v-model="playbookContent"
            @input="playbookContentModified = true"
            class="w-full h-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
            placeholder="Type your setup rules and conditions here..."
          ></textarea>
        </div>
      </div>

      <!-- Custom Columns Tab -->
      <div v-else-if="activeTab === 'custom_columns'" class="flex flex-col gap-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Custom Columns</h2>
            <p class="text-sm text-gray-500 mt-1">Add custom fields to your journal entries.</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-48">
              <BaseSelect
                id="setup-select"
                v-model="selectedSetupId"
                :options="setupOptions"
                placeholder="Select Setup"
              />
            </div>
            <button
              v-if="selectedColumns.length > 0"
              @click="deleteSelectedColumns"
              class="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm border border-red-200"
            >
              Delete Selected ({{ selectedColumns.length }})
            </button>
            <button
              @click="openAddColumnModal"
              :disabled="!selectedSetupId"
              class="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              <svg
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
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add Column
            </button>
          </div>
        </div>

        <div v-if="!selectedSetupId" class="text-center py-8 border border-dashed border-gray-300 rounded-xl mt-4">
          <p class="text-gray-500 font-medium">Please select a Setup first to manage its custom columns.</p>
        </div>
        <div v-else-if="customColumns.length === 0" class="text-center py-8 border border-dashed border-gray-300 rounded-xl mt-4">
          <p class="text-gray-500 font-medium">No custom columns found for this setup.</p>
        </div>
        <div v-else class="overflow-x-auto mt-4 rounded-xl border border-gray-200">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr
                class="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider"
              >
                <th class="py-3 px-4 w-12 text-center">
                  <input type="checkbox" :checked="selectedColumns.length === customColumns.length && customColumns.length > 0" @change="toggleAllColumns" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th class="py-3 px-4">Column Name</th>
                <th class="py-3 px-4">Type</th>
                <th class="py-3 px-4">Report Filter</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                class="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                v-for="col in customColumns"
                :key="col.id"
              >
                <td class="py-4 px-4 text-center">
                  <input type="checkbox" :value="col.id" v-model="selectedColumns" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </td>
                <td class="py-4 px-4 font-semibold text-sm text-gray-900">{{ col.name }}</td>
                <td class="py-4 px-4 text-sm text-gray-600 capitalize">{{ col.type.replace('_', ' ') }}</td>
                <td class="py-4 px-4">
                  <div 
                    :class="col.reportFilter ? 'bg-blue-600' : 'bg-gray-300'"
                    class="w-10 h-5 rounded-full relative transition-colors"
                  >
                    <div
                      class="w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all"
                      :class="col.reportFilter ? 'left-[22px]' : 'left-[3px]'"
                    ></div>
                  </div>
                </td>
                <td class="py-4 px-4 text-right">
                  <button @click="editColumn(col)" class="text-blue-500 hover:text-blue-700 font-semibold text-sm">
                    Edit
                  </button>
                  <button @click="deleteColumn(col.id)" class="text-red-500 hover:text-red-700 font-semibold text-sm ml-3">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add Setup Modal -->
    <div
      v-if="isAddSetupModalOpen"
      @click.self="closeAddSetupModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-xl font-bold text-gray-900">Add New Setup</h3>
          <button @click="closeAddSetupModal" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="p-6 flex flex-col gap-5 overflow-y-auto">
          <BaseInput
            id="setup-name"
            label="Setup Name"
            v-model="newSetup.name"
            placeholder="e.g. SMC Classic"
          />
          
          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-gray-700">Description</label>
            <textarea
              v-model="newSetup.description"
              rows="3"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              placeholder="Briefly describe this setup..."
            ></textarea>
          </div>
          
          <BaseSelect
            id="setup-type"
            label="Type"
            v-model="newSetup.type"
            :options="setupTypeOptions"
            placeholder="Select Type"
          />
        </div>
        
        <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <BaseButton variant="outline" @click="closeAddSetupModal">
            Cancel
          </BaseButton>
          <BaseButton variant="primary" @click="saveSetup" :disabled="!newSetup.name">
            Save Setup
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Add Column Modal -->
    <div
      v-if="isAddColumnModalOpen"
      @click.self="closeAddColumnModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-xl font-bold text-gray-900">{{ editingColumnId ? 'Edit Custom Column' : 'Add Custom Column' }}</h3>
          <button @click="closeAddColumnModal" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="p-6 flex flex-col gap-5 overflow-y-auto">
          <BaseInput
            id="column-name"
            label="Column Name"
            v-model="newColumn.name"
            placeholder="e.g. Confluences, RR, Emotion"
          />
          
          <BaseSelect
            id="column-type"
            label="Data Type"
            v-model="newColumn.type"
            :options="columnTypeOptions"
            placeholder="Select Data Type"
          />

          <div v-if="newColumn.type === 'single_selector' || newColumn.type === 'multiple_selector'" class="flex flex-col gap-3">
            <label class="block text-sm font-semibold text-gray-700">Options</label>
            <div v-for="(_, index) in newColumn.options" :key="index" class="flex items-center gap-2">
              <input
                type="text"
                v-model="newColumn.options[index]"
                placeholder="e.g. Option name"
                class="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                @click="removeColumnOption(index)"
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
              @click="addColumnOption"
              class="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1 self-start"
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
              Add another option
            </button>
          </div>
          
          <label class="flex items-center gap-3 cursor-pointer mt-2 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <div class="relative">
              <input type="checkbox" class="sr-only" v-model="newColumn.reportFilter" />
              <div 
                class="w-10 h-5 rounded-full transition-colors"
                :class="newColumn.reportFilter ? 'bg-blue-600' : 'bg-gray-300'"
              ></div>
              <div 
                class="absolute left-[3px] top-[3px] w-3.5 h-3.5 bg-white rounded-full transition-all"
                :class="newColumn.reportFilter ? 'translate-x-[19px]' : 'translate-x-0'"
              ></div>
            </div>
            <div>
              <div class="text-sm font-bold text-gray-900">Use as Report Filter</div>
              <div class="text-xs text-gray-500">Allow filtering journal entries by this column.</div>
            </div>
          </label>
        </div>
        
        <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <BaseButton variant="outline" @click="closeAddColumnModal">
            Cancel
          </BaseButton>
          <BaseButton variant="primary" @click="saveColumn" :disabled="!newColumn.name">
            Save Column
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Add Session Modal -->
    <div
      v-if="isAddSessionModalOpen"
      @click.self="closeAddSessionModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-xl font-bold text-gray-900">Add Session</h3>
          <button @click="closeAddSessionModal" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="p-6 flex flex-col gap-5 overflow-y-auto">
          <BaseInput
            id="session-name"
            label="Session Name"
            v-model="newSession.sessionName"
            placeholder="e.g. New York, London"
          />
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Start Time</label>
              <BaseTimeInput v-model="newSession.startTime" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">End Time</label>
              <BaseTimeInput v-model="newSession.endTime" />
            </div>
          </div>
        </div>
        
        <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <BaseButton variant="outline" @click="closeAddSessionModal">
            Cancel
          </BaseButton>
          <BaseButton variant="primary" @click="saveSession" :disabled="!newSession.sessionName || !newSession.startTime || !newSession.endTime">
            Save Session
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Confirm Modal -->
    <BaseConfirmModal
      :is-open="confirmModal.isOpen"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :confirm-text="confirmModal.confirmText"
      :cancel-text="confirmModal.cancelText"
      :variant="confirmModal.variant"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
    <!-- Alert Modal -->
    <BaseAlertDialog
      :is-open="alertModal.isOpen"
      :title="alertModal.title"
      :message="alertModal.message"
      :variant="alertModal.variant"
      @close="alertModal.isOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseSelect from '../ui/BaseSelect.vue'
import BaseTimeInput from '../ui/BaseTimeInput.vue'
import BaseConfirmModal from '../ui/BaseConfirmModal.vue'
import BaseAlertDialog from '../ui/BaseAlertDialog.vue'

// Alert Modal State
const alertModal = ref({
  isOpen: false,
  title: '',
  message: '',
  variant: 'success' as 'success' | 'error' | 'info'
})

const showAlert = (title: string, message: string, variant: 'success' | 'error' | 'info' = 'success') => {
  alertModal.value = {
    isOpen: true,
    title,
    message,
    variant
  }
}

// Confirm Modal State
const confirmModal = ref({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'danger' as 'danger' | 'info'
})

let confirmResolve: ((value: boolean) => void) | null = null

const showConfirm = (options: { title: string, message: string, confirmText?: string, cancelText?: string, variant?: 'danger' | 'info' }): Promise<boolean> => {
  confirmModal.value = {
    isOpen: true,
    title: options.title,
    message: options.message,
    confirmText: options.confirmText || 'Confirm',
    cancelText: options.cancelText || 'Cancel',
    variant: options.variant || 'danger'
  }
  return new Promise((resolve) => {
    confirmResolve = resolve
  })
}

const handleConfirm = () => {
  confirmModal.value.isOpen = false
  if (confirmResolve) confirmResolve(true)
}

const handleCancel = () => {
  confirmModal.value.isOpen = false
  if (confirmResolve) confirmResolve(false)
}

const tabs = [
  { id: 'setups', label: 'Trading Setups' },
  { id: 'symbols', label: 'Symbols' },
  { id: 'setup_sessions', label: 'Setup Sessions' },
  { id: 'setup_playbooks', label: 'Setup Playbooks' },
  { id: 'custom_columns', label: 'Custom Columns' },
  { id: 'preferences', label: 'Preferences' }
]

const activeTab = ref('setups')

// Setups State
const setups = ref<any[]>([])
const isAddSetupModalOpen = ref(false)
const newSetup = ref({
  name: '',
  description: '',
  type: 'real'
})

const setupOptions = ref<{value: number, label: string}[]>([])

const setupTypeOptions = [
  { value: 'real', label: 'Real' },
  { value: 'demo', label: 'Demo' }
]

const loadSetups = async () => {
  try {
    const res = await window.api.setups.list()
    if (res.success) {
      setups.value = res.data
      setupOptions.value = res.data.map((s: any) => ({ value: s.id, label: s.name }))
      if (setupOptions.value.length > 0 && !selectedSetupId.value) {
        selectedSetupId.value = setupOptions.value[0].value
      }
    } else {
      console.error('Failed to load setups:', res.error)
    }
  } catch (error) {
    console.error('Failed to load setups:', error)
  }
}

const openAddSetupModal = () => {
  newSetup.value = { name: '', description: '', type: 'real' }
  isAddSetupModalOpen.value = true
}

const closeAddSetupModal = () => {
  isAddSetupModalOpen.value = false
}

const saveSetup = async () => {
  if (!newSetup.value.name) return
  
  try {
    const res = await window.api.setups.create({
      name: newSetup.value.name,
      description: newSetup.value.description,
      type: newSetup.value.type
    })
    
    if (res.success) {
      await loadSetups()
      closeAddSetupModal()
      showAlert('Success', 'Trading setup saved successfully.', 'success')
    } else {
      console.error('Failed to save setup:', res.error)
      showAlert('Error', 'Failed to save setup: ' + res.error, 'error')
    }
  } catch (error) {
    console.error('Failed to save setup:', error)
    showAlert('Error', 'Failed to save setup.', 'error')
  }
}

// Symbols State
const symbols = ref<any[]>([])
const newSymbol = ref('')

const loadSymbols = async () => {
  try {
    const res = await window.api.symbols.list()
    if (res.success) {
      symbols.value = res.data
    } else {
      console.error('Failed to load symbols:', res.error)
    }
  } catch (error) {
    console.error('Failed to load symbols:', error)
  }
}

const addSymbol = async () => {
  const name = newSymbol.value.trim()
  if (!name) return
  try {
    const res = await window.api.symbols.create({ name })
    if (res.success) {
      newSymbol.value = ''
      await loadSymbols()
      showAlert('Success', 'Symbol added successfully.', 'success')
    } else {
      showAlert('Error', 'Failed to add symbol: ' + res.error, 'error')
    }
  } catch (error: any) {
    console.error('Failed to add symbol:', error)
    showAlert('Error', 'Failed to add symbol: ' + error.message, 'error')
  }
}

const deleteSymbol = async (id: number) => {
  const confirmed = await showConfirm({
    title: 'Delete Symbol',
    message: 'Are you sure you want to delete this symbol?',
    confirmText: 'Delete'
  })
  if (!confirmed) return
  try {
    const res = await window.api.symbols.delete(id)
    if (res.success) {
      await loadSymbols()
    } else {
      showAlert('Error', 'Failed to delete symbol: ' + res.error, 'error')
    }
  } catch (error) {
    console.error('Failed to delete symbol:', error)
    showAlert('Error', 'An error occurred while deleting the symbol.', 'error')
  }
}

// Custom Columns State
const selectedSetupId = ref<number | ''>('')
const customColumns = ref<any[]>([])
const isAddColumnModalOpen = ref(false)
const newColumn = ref({
  name: '',
  type: 'string',
  reportFilter: false,
  options: [] as string[]
})

const columnTypeOptions = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'switch', label: 'Switch (Yes/No)' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'single_selector', label: 'Single Selector' },
  { value: 'multiple_selector', label: 'Multiple Selector' }
]

const setupSessionsList = ref<any[]>([])
const isAddSessionModalOpen = ref(false)
const newSession = ref({
  sessionName: '',
  startTime: '',
  endTime: ''
})

const playbookContent = ref('')
const playbookContentModified = ref(false)

const loadSetupDetails = async () => {
  if (!selectedSetupId.value) {
    customColumns.value = []
    setupSessionsList.value = []
    playbookContent.value = ''
    playbookContentModified.value = false
    return
  }
  try {
    const res = await window.api.setups.getDetails(selectedSetupId.value)
    if (res.success) {
      customColumns.value = res.data.customColumns || []
      setupSessionsList.value = res.data.sessions || []
      if (res.data.playbooks && res.data.playbooks.length > 0) {
        playbookContent.value = res.data.playbooks[0].content
      } else {
        playbookContent.value = ''
      }
      playbookContentModified.value = false
    }
  } catch (error) {
    console.error('Failed to load setup details:', error)
  }
}

const savePlaybook = async () => {
  if (!selectedSetupId.value) return
  try {
    const res = await window.api.setupPlaybooks.save({
      setupId: selectedSetupId.value,
      content: playbookContent.value
    })
    if (res.success) {
      playbookContentModified.value = false
      showAlert('Success', 'Playbook saved successfully.', 'success')
    } else {
      showAlert('Error', 'Failed to save playbook: ' + res.error, 'error')
    }
  } catch (error: any) {
    console.error('Failed to save playbook:', error)
    showAlert('Error', 'Failed to save playbook: ' + (error.message || String(error)), 'error')
  }
}

watch(selectedSetupId, () => {
  selectedSessions.value = []
  selectedColumns.value = []
  loadSetupDetails()
})

const openAddSessionModal = () => {
  newSession.value = { sessionName: '', startTime: '', endTime: '' }
  isAddSessionModalOpen.value = true
}

const closeAddSessionModal = () => {
  isAddSessionModalOpen.value = false
}

const saveSession = async () => {
  console.log('saveSession called with:', newSession.value, 'setupId:', selectedSetupId.value)
  if (!newSession.value.sessionName || !selectedSetupId.value) {
    console.log('Validation failed')
    return
  }
  
  try {
    const dataToSave = {
      setupId: selectedSetupId.value,
      sessionName: newSession.value.sessionName,
      startTime: newSession.value.startTime,
      endTime: newSession.value.endTime
    }
    console.log('Calling IPC with:', dataToSave)
    const res = await window.api.setupSessions.create(dataToSave)
    console.log('IPC result:', res)
    if (res.success) {
      await loadSetupDetails()
      closeAddSessionModal()
      showAlert('Success', 'Setup session saved successfully.', 'success')
    } else {
      showAlert('Error', 'Failed to save session: ' + res.error, 'error')
    }
  } catch (error: any) {
    console.error('Failed to save session:', error)
    showAlert('Error', 'Failed to save session: ' + (error.message || String(error)), 'error')
  }
}

const deleteSession = async (id: number) => {
  const confirmed = await showConfirm({
    title: 'Delete Session',
    message: 'Are you sure you want to delete this session?',
    confirmText: 'Delete'
  })
  if (!confirmed) return
  try {
    const res = await window.api.setupSessions.delete(id)
    if (res.success) {
      selectedSessions.value = selectedSessions.value.filter(sid => sid !== id)
      await loadSetupDetails()
    } else {
      showAlert('Error', 'Failed to delete session: ' + res.error, 'error')
    }
  } catch (error) {
    console.error('Failed to delete session:', error)
    showAlert('Error', 'An error occurred while deleting the session.', 'error')
  }
}

const selectedSessions = ref<number[]>([])

const toggleAllSessions = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.checked) {
    selectedSessions.value = setupSessionsList.value.map(s => s.id)
  } else {
    selectedSessions.value = []
  }
}

const deleteSelectedSessions = async () => {
  const confirmed = await showConfirm({
    title: 'Delete Selected Sessions',
    message: `Are you sure you want to delete ${selectedSessions.value.length} selected sessions?`,
    confirmText: 'Delete'
  })
  if (!confirmed) return
  try {
    const promises = selectedSessions.value.map(id => window.api.setupSessions.delete(id))
    const results = await Promise.all(promises)
    const allSuccess = results.every((r: any) => r.success)
    if (!allSuccess) {
      showAlert('Warning', 'Some sessions failed to delete.', 'error')
    }
    selectedSessions.value = []
    await loadSetupDetails()
  } catch (error) {
    console.error('Failed to delete selected sessions:', error)
    showAlert('Error', 'An error occurred while deleting sessions.', 'error')
  }
}

const editingColumnId = ref<number | null>(null)

const openAddColumnModal = () => {
  editingColumnId.value = null
  newColumn.value = { name: '', type: 'string', reportFilter: false, options: [''] }
  isAddColumnModalOpen.value = true
}

const editColumn = (col: any) => {
  editingColumnId.value = col.id
  let opts = col.options || []
  if (opts.length === 0) opts = ['']
  newColumn.value = {
    name: col.name,
    type: col.type,
    reportFilter: !!col.reportFilter,
    options: [...opts]
  }
  isAddColumnModalOpen.value = true
}

const closeAddColumnModal = () => {
  isAddColumnModalOpen.value = false
  editingColumnId.value = null
}

const addColumnOption = () => {
  newColumn.value.options.push('')
}

const removeColumnOption = (index: number) => {
  newColumn.value.options.splice(index, 1)
  if (newColumn.value.options.length === 0) {
    newColumn.value.options.push('')
  }
}

const saveColumn = async () => {
  if (!newColumn.value.name || !selectedSetupId.value) return
  
  let optionsToSave: string[] = []
  if (['single_selector', 'multiple_selector'].includes(newColumn.value.type)) {
    optionsToSave = newColumn.value.options
      .map(s => s.trim())
      .filter(s => s.length > 0)
  }

  try {
    const payload = {
      setupId: selectedSetupId.value,
      name: newColumn.value.name,
      type: newColumn.value.type,
      reportFilter: newColumn.value.reportFilter,
      options: optionsToSave.length > 0 ? optionsToSave : null
    }

    let res
    if (editingColumnId.value) {
      res = await window.api.customColumns.update(editingColumnId.value, payload)
    } else {
      res = await window.api.customColumns.create(payload)
    }

    if (res.success) {
      await loadSetupDetails()
      closeAddColumnModal()
      showAlert('Success', editingColumnId.value ? 'Custom column updated successfully.' : 'Custom column saved successfully.', 'success')
    } else {
      showAlert('Error', 'Failed to save column: ' + res.error, 'error')
    }
  } catch (error: any) {
    console.error('Failed to save column:', error)
    showAlert('Error', 'Failed to save column: ' + (error.message || String(error)), 'error')
  }
}

const deleteColumn = async (id: number) => {
  const confirmed = await showConfirm({
    title: 'Delete Column',
    message: 'Are you sure you want to delete this column?',
    confirmText: 'Delete'
  })
  if (!confirmed) return
  try {
    const res = await window.api.customColumns.delete(id)
    if (res.success) {
      selectedColumns.value = selectedColumns.value.filter(cid => cid !== id)
      await loadSetupDetails()
    } else {
      showAlert('Error', 'Failed to delete column: ' + res.error, 'error')
    }
  } catch (error) {
    console.error('Failed to delete column:', error)
    showAlert('Error', 'An error occurred while deleting the column.', 'error')
  }
}

const selectedColumns = ref<number[]>([])

const toggleAllColumns = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.checked) {
    selectedColumns.value = customColumns.value.map(c => c.id)
  } else {
    selectedColumns.value = []
  }
}

const deleteSelectedColumns = async () => {
  const confirmed = await showConfirm({
    title: 'Delete Selected Columns',
    message: `Are you sure you want to delete ${selectedColumns.value.length} selected columns?`,
    confirmText: 'Delete'
  })
  if (!confirmed) return
  try {
    const promises = selectedColumns.value.map(id => window.api.customColumns.delete(id))
    const results = await Promise.all(promises)
    const allSuccess = results.every((r: any) => r.success)
    if (!allSuccess) {
      showAlert('Warning', 'Some columns failed to delete.', 'error')
    }
    selectedColumns.value = []
    await loadSetupDetails()
  } catch (error) {
    console.error('Failed to delete selected columns:', error)
    showAlert('Error', 'Failed to delete selected columns.', 'error')
  }
}

onMounted(() => {
  loadSetups()
  loadSymbols()
})
</script>
