<template>
  <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <i class="ph ph-funnel text-primary text-base"></i>
        <span class="text-xs font-bold text-gray-800 uppercase tracking-wider">ตัวกรองข้อมูลวิจัย (Research Filters)</span>
      </div>
      <button
        v-if="hasActiveFilters"
        type="button"
        @click="resetFilters"
        class="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
      >
        <i class="ph ph-arrow-counter-clockwise"></i>
        ล้างตัวกรองทั้งหมด
      </button>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <!-- Setup Filter -->
      <div>
        <label class="block text-[11px] font-bold text-gray-600 mb-1">Setup</label>
        <select
          v-model="filters.setupId"
          class="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option :value="undefined">ทุก Setup</option>
          <option v-for="s in setups" :key="s.id" :value="s.id">
            {{ s.name }}
          </option>
        </select>
      </div>

      <!-- Symbol Filter -->
      <div>
        <label class="block text-[11px] font-bold text-gray-600 mb-1">Symbol</label>
        <select
          v-model="filters.symbolId"
          class="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option :value="undefined">ทุก Symbol</option>
          <option v-for="sym in symbols" :key="sym.id" :value="sym.id">
            {{ sym.name }}
          </option>
        </select>
      </div>

      <!-- Session Filter -->
      <div>
        <label class="block text-[11px] font-bold text-gray-600 mb-1">Session</label>
        <select
          v-model="filters.sessionName"
          class="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option :value="undefined">ทุก Session</option>
          <option value="Asia">Asia</option>
          <option value="Tokyo">Tokyo</option>
          <option value="London">London</option>
          <option value="London Close">London Close</option>
          <option value="New York">New York</option>
        </select>
      </div>

      <!-- Timeframe Filter -->
      <div>
        <label class="block text-[11px] font-bold text-gray-600 mb-1">Timeframe</label>
        <select
          v-model="filters.timeframe"
          class="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option :value="undefined">ทุก Timeframe</option>
          <option value="M1">M1</option>
          <option value="M5">M5</option>
          <option value="M15">M15</option>
          <option value="M30">M30</option>
          <option value="H1">H1</option>
          <option value="H4">H4</option>
          <option value="D1">D1</option>
        </select>
      </div>

      <!-- News Filter -->
      <div>
        <label class="block text-[11px] font-bold text-gray-600 mb-1">ข่าว (News)</label>
        <select
          v-model="newsSelect"
          class="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">ทั้งหมด</option>
          <option value="news">เฉพาะมีข่าว</option>
          <option value="no-news">เฉพาะไม่มีข่าว</option>
        </select>
      </div>

      <!-- Quality Filter -->
      <div>
        <label class="block text-[11px] font-bold text-gray-600 mb-1">Trade Quality</label>
        <select
          v-model="filters.quality"
          class="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option :value="undefined">ทุกเกรด</option>
          <option value="A+">เกรด A+</option>
          <option value="A">เกรด A</option>
          <option value="B">เกรด B</option>
          <option value="C">เกรด C</option>
        </select>
      </div>
    </div>

    <!-- Date Range Filter Row -->
    <div class="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div class="flex items-center gap-2">
        <i class="ph ph-calendar text-gray-500"></i>
        <span class="font-bold text-gray-700">ช่วงเวลา (Date Range):</span>
        <div class="inline-flex rounded-lg bg-gray-100 p-0.5 border border-gray-200">
          <button
            type="button"
            v-for="p in datePresetOptions"
            :key="p.key"
            @click="setDatePreset(p.key)"
            :class="[
              'px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer',
              datePreset === p.key ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
            ]"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5">
          <span class="text-gray-400 font-medium text-[11px]">จาก:</span>
          <input
            type="date"
            v-model="filters.startDate"
            @change="datePreset = 'custom'"
            class="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-gray-400 font-medium text-[11px]">ถึง:</span>
          <input
            type="date"
            v-model="filters.endDate"
            @change="datePreset = 'custom'"
            class="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import type { ResearchFilters } from '../../../../../shared/types'

const props = defineProps<{
  modelValue: ResearchFilters
  setups: Array<{ id: number; name: string }>
  symbols: Array<{ id: number; name: string }>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ResearchFilters): void
  (e: 'change'): void
}>()

const filters = ref<ResearchFilters>({ ...props.modelValue })
const newsSelect = ref<'all' | 'news' | 'no-news'>('all')
const datePreset = ref<'all' | 'today' | 'week' | 'month' | 'custom'>('all')

const datePresetOptions: Array<{ key: 'all' | 'today' | 'week' | 'month'; label: string }> = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'today', label: 'วันนี้' },
  { key: 'week', label: 'สัปดาห์นี้' },
  { key: 'month', label: 'เดือนนี้' }
]

const setDatePreset = (preset: 'all' | 'today' | 'week' | 'month' | 'custom') => {
  datePreset.value = preset
  const now = new Date()

  if (preset === 'all') {
    filters.value.startDate = undefined
    filters.value.endDate = undefined
  } else if (preset === 'today') {
    const todayStr = now.toISOString().slice(0, 10)
    filters.value.startDate = todayStr
    filters.value.endDate = todayStr
  } else if (preset === 'week') {
    const curr = new Date()
    const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1)
    const monday = new Date(curr.setDate(first))
    filters.value.startDate = monday.toISOString().slice(0, 10)
    filters.value.endDate = new Date().toISOString().slice(0, 10)
  } else if (preset === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    filters.value.startDate = firstDay.toISOString().slice(0, 10)
    filters.value.endDate = new Date().toISOString().slice(0, 10)
  }
}

watch(
  () => props.modelValue,
  (val) => {
    filters.value = { ...val }
    if (val.news === true) newsSelect.value = 'news'
    else if (val.news === false) newsSelect.value = 'no-news'
    else newsSelect.value = 'all'
    if (!val.startDate && !val.endDate) {
      datePreset.value = 'all'
    }
  },
  { deep: true }
)

watch(newsSelect, (val) => {
  if (val === 'news') filters.value.news = true
  else if (val === 'no-news') filters.value.news = false
  else filters.value.news = undefined
})

watch(
  filters,
  (newVal) => {
    emit('update:modelValue', { ...newVal })
    emit('change')
  },
  { deep: true }
)

const hasActiveFilters = computed(() => {
  return (
    filters.value.setupId !== undefined ||
    filters.value.symbolId !== undefined ||
    filters.value.sessionName !== undefined ||
    filters.value.timeframe !== undefined ||
    filters.value.news !== undefined ||
    filters.value.quality !== undefined ||
    filters.value.startDate !== undefined ||
    filters.value.endDate !== undefined
  )
})

const resetFilters = () => {
  filters.value = {
    setupId: undefined,
    symbolId: undefined,
    sessionName: undefined,
    timeframe: undefined,
    news: undefined,
    quality: undefined,
    startDate: undefined,
    endDate: undefined
  }
  newsSelect.value = 'all'
  datePreset.value = 'all'
}
</script>
