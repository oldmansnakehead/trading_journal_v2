<template>
  <div v-if="show" @click.self="close" class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b border-gray-100">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Trade Details</h2>
          <p class="text-sm text-gray-500">
            {{ trade ? new Date(trade.entryDatetime).toLocaleString() : 'Loading...' }}
          </p>
        </div>
        <button @click="close" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto flex-1 bg-gray-50/50">
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
        <div v-else-if="trade" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Basic Info -->
          <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 class="font-bold text-gray-900 border-b border-gray-100 pb-2">Overview</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500">Symbol</p>
                <p class="font-semibold">{{ trade.symbolName || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Setup</p>
                <p class="font-semibold">{{ trade.setupName || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Position</p>
                <span :class="['px-2 py-0.5 rounded text-xs font-bold', trade.position === 'Buy' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700']">
                  {{ trade.position || '-' }}
                </span>
              </div>
              <div>
                <p class="text-xs text-gray-500">Session</p>
                <p class="font-semibold">{{ trade.sessionName || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Direction Bias</p>
                <p class="font-semibold">{{ trade.directionBias || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Timeframe</p>
                <p class="font-semibold">{{ trade.entryTimeframe || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">News Filter</p>
                <p class="font-semibold">{{ trade.news ? 'Yes' : 'No' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Quality</p>
                <div class="flex items-center gap-2">
                  <div
                    :class="['w-3 h-3 rounded-full', { 'bg-green-500': trade.quality === 'Green', 'bg-blue-500': trade.quality === 'Blue', 'bg-yellow-400': trade.quality === 'Yellow', 'bg-orange-500': trade.quality === 'Orange', 'bg-red-500': trade.quality === 'Red' }]"
                  ></div>
                  <span class="font-semibold">{{ trade.quality || '-' }}</span>
                </div>
              </div>
              <div>
                <p class="text-xs text-gray-500">Entry Time</p>
                <p class="font-semibold text-xs">{{ trade.entryDatetime ? new Date(trade.entryDatetime).toLocaleString() : '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Exit Time</p>
                <p class="font-semibold text-xs">{{ trade.exitDatetime ? new Date(trade.exitDatetime).toLocaleString() : '-' }}</p>
              </div>
              <div class="col-span-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex items-center justify-between">
                <span class="text-xs text-gray-500 font-medium">Holding Duration</span>
                <span class="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                  <i class="ph-bold ph-timer text-blue-500"></i>
                  {{ calculateTradeDuration(trade.entryDatetime, trade.exitDatetime).text }}
                </span>
              </div>
            </div>
          </div>

          <!-- Risk & Reward -->
          <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 class="font-bold text-gray-900 border-b border-gray-100 pb-2">Risk & Reward</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                <span class="text-gray-500">Normal</span>
                <span :class="['font-bold', trade.normalRr > 0 ? 'text-green-600' : trade.normalRr < 0 ? 'text-red-600' : 'text-gray-500']">{{ trade.normalRr || 0 }}R</span>
              </div>
              <div class="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                <span class="text-gray-500">Break Even</span>
                <span :class="['font-bold', trade.beRr > 0 ? 'text-green-600' : trade.beRr < 0 ? 'text-red-600' : 'text-gray-500']">{{ trade.beRr || 0 }}R</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500">Trail</span>
                <span :class="['font-bold', trade.trailRr > 0 ? 'text-green-600' : trade.trailRr < 0 ? 'text-red-600' : 'text-gray-500']">{{ trade.trailRr || 0 }}R</span>
              </div>
            </div>
          </div>

          <!-- Custom Data -->
          <div v-if="parsedCustomData && Object.keys(parsedCustomData).length > 0" class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4 md:col-span-2">
            <h3 class="font-bold text-gray-900 border-b border-gray-100 pb-2">Custom Fields</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div v-for="(val, key) in parsedCustomData" :key="key">
                <p class="text-xs text-gray-500">{{ customFieldNames[key] || key }}</p>
                <div v-if="Array.isArray(val)" class="flex flex-wrap gap-1 mt-1">
                  <span v-for="item in val" :key="item" class="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-xs font-semibold">
                    {{ item }}
                  </span>
                </div>
                <div v-else-if="typeof val === 'boolean' || customFieldTypes[key] === 'switch' || customFieldTypes[key] === 'checkbox'" class="mt-1">
                  <span :class="['px-2 py-0.5 rounded text-xs font-semibold', String(val) === 'true' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                    {{ String(val) === 'true' ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div v-else-if="customFieldTypes[key] === 'single_selector' && val" class="mt-1">
                  <span class="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-xs font-semibold">
                    {{ val }}
                  </span>
                </div>
                <p v-else class="font-semibold mt-1">{{ val !== undefined && val !== null && val !== '' ? val : '-' }}</p>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="trade.notes" class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4 md:col-span-2">
            <h3 class="font-bold text-gray-900 border-b border-gray-100 pb-2">Notes</h3>
            <p class="text-gray-700 whitespace-pre-wrap text-sm">{{ trade.notes }}</p>
          </div>

          <!-- Images -->
          <div v-if="parsedImages && parsedImages.length > 0" class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4 md:col-span-2">
            <h3 class="font-bold text-gray-900 border-b border-gray-100 pb-2">Screenshots</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="(img, idx) in parsedImages" :key="idx" class="border border-gray-200 rounded-lg overflow-hidden">
                <img :src="formatImageUrl(img)" class="w-full object-cover" />
              </div>
            </div>
          </div>

        </div>
        <div v-else class="text-center py-12 text-gray-500">
          Failed to load trade details.
        </div>
      </div>
      
      <!-- Footer -->
      <div class="p-4 border-t border-gray-100 bg-white flex justify-end">
        <button @click="close" class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { calculateTradeDuration } from '../../utils/duration'

const props = defineProps<{
  show: boolean
  tradeId: number | null
}>()

const emit = defineEmits(['update:show'])

const trade = ref<any>(null)
const loading = ref(false)
const customFieldNames = ref<Record<string, string>>({})
const customFieldTypes = ref<Record<string, string>>({})

const close = () => {
  emit('update:show', false)
}

const parsedCustomData = computed(() => {
  if (!trade.value || !trade.value.customData) return {}
  try {
    const data = typeof trade.value.customData === 'string' ? JSON.parse(trade.value.customData) : trade.value.customData
    // Parse nested stringified arrays if needed
    for (const key in data) {
      if (typeof data[key] === 'string' && data[key].startsWith('[') && data[key].endsWith(']')) {
        try {
          data[key] = JSON.parse(data[key])
        } catch (e) {}
      }
    }
    return data
  } catch (e) {
    return {}
  }
})

const parsedImages = computed(() => {
  if (!trade.value || !trade.value.images) return []
  try {
    return typeof trade.value.images === 'string' ? JSON.parse(trade.value.images) : trade.value.images
  } catch (e) {
    return []
  }
})

const fetchCustomColumns = async (setupId: number) => {
  try {
    const res = await window.api.setups.getDetails(setupId)
    if (res.success && res.data && res.data.customColumns) {
      const names: Record<string, string> = {}
      const types: Record<string, string> = {}
      res.data.customColumns.forEach((col: any) => {
        names[col.id.toString()] = col.name
        types[col.id.toString()] = col.type
      })
      customFieldNames.value = names
      customFieldTypes.value = types
    }
  } catch (e) {
    console.error('Failed to load custom columns:', e)
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

const loadTrade = async (id: number) => {
  loading.value = true
  trade.value = null
  try {
    const res = await window.api.journal.get(id)
    if (res.success) {
      trade.value = res.data
      if (trade.value.setupId) {
        await fetchCustomColumns(trade.value.setupId)
      }
    } else {
      console.error('Failed to load trade:', res.error)
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

watch(() => props.tradeId, (newId) => {
  if (newId && props.show) {
    loadTrade(newId)
  }
})

watch(() => props.show, (newShow) => {
  if (newShow && props.tradeId && !trade.value) {
    loadTrade(props.tradeId)
  }
})
</script>
