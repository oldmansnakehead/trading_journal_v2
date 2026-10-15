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
          <tr
            v-for="item in paginatedRows"
            :key="item.id"
            class="hover:bg-gray-50 border-b border-gray-100 transition-colors"
          >
            <td class="py-4 px-6">
              <input
                type="checkbox"
                class="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
            </td>
            <td class="py-4 px-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                  :class="item.avatarBg"
                >
                  {{ item.avatarChar }}
                </div>
                <div>
                  <p class="font-bold text-textPrimary">{{ item.name }}</p>
                  <p class="text-xs text-textSecondary">{{ item.invoice }}</p>
                </div>
              </div>
            </td>
            <td class="py-4 px-4 text-textPrimary">
              <p>{{ item.createDate }}</p>
              <p class="text-xs text-textSecondary">{{ item.createTime }}</p>
            </td>
            <td class="py-4 px-4 text-textPrimary">
              <p>{{ item.dueDate }}</p>
              <p class="text-xs text-textSecondary">{{ item.dueTime }}</p>
            </td>
            <td class="py-4 px-4 text-textPrimary">{{ item.amount }}</td>
            <td class="py-4 px-4 text-textSecondary">{{ item.sent }}</td>
            <td class="py-4 px-4">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold"
                :class="item.statusClass"
              >
                {{ item.status }}
              </span>
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
    <BasePagination
      v-model:currentPage="currentPage"
      v-model:pageSize="pageSize"
      :totalItems="rows.length"
      itemLabel="invoices"
      :pageSizeOptions="[5, 10, 25]"
      class="mt-auto border-t border-gray-200"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BasePagination from './BasePagination.vue'
import BaseSelect from './BaseSelect.vue'
import { paginateItems } from '../../utils/pagination'

const rows = ref([
  {
    id: 1,
    name: 'Amiah Pruitt',
    invoice: 'INV-19919',
    avatarBg: 'bg-blue-100 text-blue-600',
    avatarChar: 'A',
    createDate: '21 Sep 2026',
    createTime: '2:27 pm',
    dueDate: '14 Nov 2026',
    dueTime: '9:27 am',
    amount: '$2,331.63',
    sent: 9,
    status: 'Paid',
    statusClass: 'bg-success/20 text-success-dark'
  },
  {
    id: 2,
    name: 'Lawson Bass',
    invoice: 'INV-19917',
    avatarBg: 'bg-purple-100 text-purple-600',
    avatarChar: 'L',
    createDate: '23 Sep 2026',
    createTime: '2:27 pm',
    dueDate: '12 Nov 2026',
    dueTime: '7:27 am',
    amount: '$2,283.97',
    sent: 9,
    status: 'Pending',
    statusClass: 'bg-warning/20 text-warning-dark'
  },
  {
    id: 3,
    name: 'Ariana Lang',
    invoice: 'INV-19918',
    avatarBg: 'bg-red-100 text-red-600',
    avatarChar: 'A',
    createDate: '22 Sep 2026',
    createTime: '2:27 pm',
    dueDate: '13 Nov 2026',
    dueTime: '8:27 am',
    amount: '$2,372.93',
    sent: 4,
    status: 'Overdue',
    statusClass: 'bg-error/20 text-error-dark'
  },
  {
    id: 4,
    name: 'Corbin Trevino',
    invoice: 'INV-19916',
    avatarBg: 'bg-emerald-100 text-emerald-600',
    avatarChar: 'C',
    createDate: '24 Sep 2026',
    createTime: '11:15 am',
    dueDate: '10 Nov 2026',
    dueTime: '4:00 pm',
    amount: '$1,850.00',
    sent: 2,
    status: 'Paid',
    statusClass: 'bg-success/20 text-success-dark'
  },
  {
    id: 5,
    name: 'Daisy Morgan',
    invoice: 'INV-19915',
    avatarBg: 'bg-amber-100 text-amber-600',
    avatarChar: 'D',
    createDate: '25 Sep 2026',
    createTime: '10:00 am',
    dueDate: '08 Nov 2026',
    dueTime: '1:30 pm',
    amount: '$940.50',
    sent: 5,
    status: 'Pending',
    statusClass: 'bg-warning/20 text-warning-dark'
  },
  {
    id: 6,
    name: 'Ethan Hunt',
    invoice: 'INV-19914',
    avatarBg: 'bg-indigo-100 text-indigo-600',
    avatarChar: 'E',
    createDate: '26 Sep 2026',
    createTime: '3:45 pm',
    dueDate: '05 Nov 2026',
    dueTime: '12:00 pm',
    amount: '$3,120.00',
    sent: 1,
    status: 'Draft',
    statusClass: 'bg-gray-200 text-gray-600'
  },
  {
    id: 7,
    name: 'Fiona Gallagher',
    invoice: 'INV-19913',
    avatarBg: 'bg-pink-100 text-pink-600',
    avatarChar: 'F',
    createDate: '27 Sep 2026',
    createTime: '9:10 am',
    dueDate: '02 Nov 2026',
    dueTime: '5:00 pm',
    amount: '$1,430.20',
    sent: 3,
    status: 'Paid',
    statusClass: 'bg-success/20 text-success-dark'
  }
])

const currentPage = ref(1)
const pageSize = ref(5)

const paginatedRows = computed(() => {
  return paginateItems(rows.value, currentPage.value, pageSize.value)
})
</script>
