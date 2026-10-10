<template>
  <div class="bg-white rounded-2xl shadow-card overflow-hidden w-full h-full flex flex-col">
    <!-- Tabs -->
    <div class="flex px-6 border-b border-gray-100 overflow-x-auto no-scrollbar">
      <button
        class="flex items-center gap-2 py-4 px-2 border-b-2 border-primary text-primary font-bold text-sm whitespace-nowrap"
      >
        All <span class="bg-primary text-white text-xs px-2 py-0.5 rounded-md">20</span>
      </button>
      <button
        class="flex items-center gap-2 py-4 px-4 border-b-2 border-transparent text-textSecondary hover:text-textPrimary font-semibold text-sm whitespace-nowrap transition-colors"
      >
        Paid <span class="bg-success/20 text-success-dark text-xs px-2 py-0.5 rounded-md">10</span>
      </button>
      <button
        class="flex items-center gap-2 py-4 px-4 border-b-2 border-transparent text-textSecondary hover:text-textPrimary font-semibold text-sm whitespace-nowrap transition-colors"
      >
        Pending
        <span class="bg-warning/20 text-warning-dark text-xs px-2 py-0.5 rounded-md">6</span>
      </button>
      <button
        class="flex items-center gap-2 py-4 px-4 border-b-2 border-transparent text-textSecondary hover:text-textPrimary font-semibold text-sm whitespace-nowrap transition-colors"
      >
        Overdue <span class="bg-error/20 text-error-dark text-xs px-2 py-0.5 rounded-md">2</span>
      </button>
      <button
        class="flex items-center gap-2 py-4 px-4 border-b-2 border-transparent text-textSecondary hover:text-textPrimary font-semibold text-sm whitespace-nowrap transition-colors"
      >
        Draft <span class="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-md">2</span>
      </button>
    </div>

    <!-- Toolbar -->
    <div class="p-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
      <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <BaseSelect modelValue="Service" :options="['Service']" />
        <div class="flex gap-2">
          <div class="relative">
            <input
              type="text"
              placeholder="Start date"
              class="bg-white border border-gray-200 text-sm rounded-lg pl-4 pr-10 py-2.5 w-32 focus:outline-none"
            />
            <i
              class="ph ph-calendar-blank absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            ></i>
          </div>
          <div class="relative">
            <input
              type="text"
              placeholder="End date"
              class="bg-white border border-gray-200 text-sm rounded-lg pl-4 pr-10 py-2.5 w-32 focus:outline-none"
            />
            <i
              class="ph ph-calendar-blank absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            ></i>
          </div>
        </div>
      </div>
      <div class="relative w-full md:w-72 flex items-center gap-2">
        <div class="relative flex-1">
          <i
            class="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          ></i>
          <input
            type="text"
            placeholder="Search customer or invoice number..."
            class="bg-white border border-gray-200 text-sm rounded-lg pl-10 pr-4 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        <button class="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">
          <i class="ph-bold ph-faders"></i>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr class="bg-gray-50 border-y border-gray-200 text-textSecondary text-sm font-semibold">
            <th class="py-4 px-6 w-12">
              <input
                type="checkbox"
                class="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
            </th>
            <th class="py-4 px-4 cursor-pointer hover:text-textPrimary">Customer</th>
            <th class="py-4 px-4 cursor-pointer hover:text-textPrimary flex items-center">
              Create <i class="ph-bold ph-arrow-up ml-1 text-xs"></i>
            </th>
            <th class="py-4 px-4 cursor-pointer hover:text-textPrimary">Due</th>
            <th class="py-4 px-4 cursor-pointer hover:text-textPrimary">Amount</th>
            <th class="py-4 px-4 cursor-pointer hover:text-textPrimary">Sent</th>
            <th class="py-4 px-4 cursor-pointer hover:text-textPrimary">Status</th>
            <th class="py-4 px-6 w-12"></th>
          </tr>
        </thead>
        <tbody class="text-sm font-medium">
          <tr class="hover:bg-gray-50 border-b border-gray-100 transition-colors">
            <td class="py-4 px-6">
              <input
                type="checkbox"
                class="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
            </td>
            <td class="py-4 px-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold"
                >
                  A
                </div>
                <div>
                  <p class="font-bold text-textPrimary">Amiah Pruitt</p>
                  <p class="text-xs text-textSecondary">INV-19919</p>
                </div>
              </div>
            </td>
            <td class="py-4 px-4 text-textPrimary">
              <p>21 Sep 2026</p>
              <p class="text-xs text-textSecondary">2:27 pm</p>
            </td>
            <td class="py-4 px-4 text-textPrimary">
              <p>14 Nov 2026</p>
              <p class="text-xs text-textSecondary">9:27 am</p>
            </td>
            <td class="py-4 px-4 text-textPrimary">$2,331.63</td>
            <td class="py-4 px-4 text-textSecondary">9</td>
            <td class="py-4 px-4">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-success/20 text-success-dark"
                >Paid</span
              >
            </td>
            <td class="py-4 px-6 text-right">
              <button class="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-200">
                <i class="ph-bold ph-dots-three-vertical"></i>
              </button>
            </td>
          </tr>
          <tr class="hover:bg-gray-50 border-b border-gray-100 transition-colors">
            <td class="py-4 px-6">
              <input
                type="checkbox"
                class="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
            </td>
            <td class="py-4 px-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold"
                >
                  L
                </div>
                <div>
                  <p class="font-bold text-textPrimary">Lawson Bass</p>
                  <p class="text-xs text-textSecondary">INV-19917</p>
                </div>
              </div>
            </td>
            <td class="py-4 px-4 text-textPrimary">
              <p>23 Sep 2026</p>
              <p class="text-xs text-textSecondary">2:27 pm</p>
            </td>
            <td class="py-4 px-4 text-textPrimary">
              <p>12 Nov 2026</p>
              <p class="text-xs text-textSecondary">7:27 am</p>
            </td>
            <td class="py-4 px-4 text-textPrimary">$2,283.97</td>
            <td class="py-4 px-4 text-textSecondary">9</td>
            <td class="py-4 px-4">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-warning/20 text-warning-dark"
                >Pending</span
              >
            </td>
            <td class="py-4 px-6 text-right">
              <button class="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-200">
                <i class="ph-bold ph-dots-three-vertical"></i>
              </button>
            </td>
          </tr>
          <tr class="hover:bg-gray-50 border-b border-gray-100 transition-colors">
            <td class="py-4 px-6">
              <input
                type="checkbox"
                class="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
            </td>
            <td class="py-4 px-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold"
                >
                  A
                </div>
                <div>
                  <p class="font-bold text-textPrimary">Ariana Lang</p>
                  <p class="text-xs text-textSecondary">INV-19918</p>
                </div>
              </div>
            </td>
            <td class="py-4 px-4 text-textPrimary">
              <p>22 Sep 2026</p>
              <p class="text-xs text-textSecondary">2:27 pm</p>
            </td>
            <td class="py-4 px-4 text-textPrimary">
              <p>13 Nov 2026</p>
              <p class="text-xs text-textSecondary">8:27 am</p>
            </td>
            <td class="py-4 px-4 text-textPrimary">$2,372.93</td>
            <td class="py-4 px-4 text-textSecondary">4</td>
            <td class="py-4 px-4">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-error/20 text-error-dark"
                >Overdue</span
              >
            </td>
            <td class="py-4 px-6 text-right">
              <button class="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-200">
                <i class="ph-bold ph-dots-three-vertical"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Footer -->
    <div
      class="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white mt-auto"
    >
      <div class="flex items-center gap-2">
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" value="" class="sr-only peer" />
          <div
            class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"
          ></div>
        </label>
        <span class="text-sm font-semibold text-textPrimary">Dense</span>
      </div>
      <div class="flex items-center text-sm font-semibold text-textSecondary gap-6">
        <div class="flex items-center gap-2">
          Rows per page:
          <BaseSelect modelValue="5" :options="['5', '10', '25']" />
        </div>
        <span>1-5 of 20</span>
        <div class="flex gap-2">
          <button class="p-1 hover:bg-gray-100 rounded text-gray-400 cursor-not-allowed">
            <i class="ph-bold ph-caret-left text-lg"></i>
          </button>
          <button class="p-1 hover:bg-gray-100 rounded text-textPrimary">
            <i class="ph-bold ph-caret-right text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseSelect from './BaseSelect.vue'
// DataTable component
</script>
