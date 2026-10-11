<template>
  <div v-if="show" @click.self="close" class="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/90 backdrop-blur-sm">
    <!-- Top Right Actions -->
    <div class="absolute top-6 right-6 flex items-center gap-4 z-[120]">
      <!-- Fullscreen Button -->
      <button @click="toggleFullscreen" class="text-white/70 hover:text-white transition-colors" title="Toggle Fullscreen">
        <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
        </svg>
      </button>

      <!-- Close Button -->
      <button @click="close" class="text-white/70 hover:text-white transition-colors" title="Close">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div v-if="loading" class="flex justify-center items-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>
    
    <div v-else-if="parsedImages.length === 0" class="text-white/50 text-lg">
      No screenshots available for this trade.
    </div>

    <div v-else @click.self="close" class="relative w-full h-full flex items-center justify-center p-8 group">
      
      <!-- Left Arrow -->
      <button 
        v-if="parsedImages.length > 1"
        @click="prevImage" 
        class="absolute left-6 p-4 rounded-full bg-black/30 text-white/50 hover:bg-black/50 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-[120]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <!-- Main Image -->
      <img :src="formatImageUrl(parsedImages[currentIndex])" class="max-w-full max-h-full object-contain drop-shadow-2xl rounded-xl" />

      <!-- Right Arrow -->
      <button 
        v-if="parsedImages.length > 1"
        @click="nextImage" 
        class="absolute right-6 p-4 rounded-full bg-black/30 text-white/50 hover:bg-black/50 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-[120]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <!-- Indicator -->
      <div v-if="parsedImages.length > 1" class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-md">
        <span 
          v-for="(_, idx) in parsedImages" 
          :key="idx" 
          :class="['w-2 h-2 rounded-full transition-all', idx === currentIndex ? 'bg-white w-4' : 'bg-white/30']"
        ></span>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  show: boolean
  tradeId: number | null
}>()

const emit = defineEmits(['update:show'])

const trade = ref<any>(null)
const loading = ref(false)
const currentIndex = ref(0)

const close = () => {
  emit('update:show', false)
}

const parsedImages = computed(() => {
  if (!trade.value || !trade.value.images) return []
  try {
    return typeof trade.value.images === 'string' ? JSON.parse(trade.value.images) : trade.value.images
  } catch (e) {
    return []
  }
})

const prevImage = () => {
  if (parsedImages.value.length === 0) return
  currentIndex.value = currentIndex.value === 0 ? parsedImages.value.length - 1 : currentIndex.value - 1
}

const nextImage = () => {
  if (parsedImages.value.length === 0) return
  currentIndex.value = currentIndex.value === parsedImages.value.length - 1 ? 0 : currentIndex.value + 1
}

const formatImageUrl = (url: string) => {
  if (!url) return ''
  // Handle TradingView /x/ links
  const tvMatch = url.match(/tradingview\.com\/x\/([a-zA-Z0-9]+)/)
  if (tvMatch && tvMatch[1]) {
    const id = tvMatch[1]
    return `https://s3.tradingview.com/snapshots/${id[0].toLowerCase()}/${id}.png`
  }
  // Handle standard URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // Handle local files
  return `app-img://${url}`
}

const loadTrade = async (id: number) => {
  loading.value = true
  trade.value = null
  currentIndex.value = 0
  try {
    const res = await window.api.journal.get(id)
    if (res.success) {
      trade.value = res.data
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

const isFullscreen = ref(false)

const toggleFullscreen = async () => {
  if (!document.fullscreenElement) {
    try {
      await document.documentElement.requestFullscreen()
      isFullscreen.value = true
    } catch (err) {
      console.error(`Error attempting to enable fullscreen: ${err}`)
    }
  } else {
    if (document.exitFullscreen) {
      await document.exitFullscreen()
      isFullscreen.value = false
    }
  }
}

// Watch fullscreen change outside our control
watch(() => props.show, (newShow) => {
  const fsHandler = () => {
    isFullscreen.value = !!document.fullscreenElement
  }
  if (newShow) {
    document.addEventListener('fullscreenchange', fsHandler)
  } else {
    document.removeEventListener('fullscreenchange', fsHandler)
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
  }
})

// Keyboard navigation
watch(() => props.show, (newShow) => {
  const handler = (e: KeyboardEvent) => {
    if (!newShow) return
    if (e.key === 'ArrowLeft') prevImage()
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'Escape') close()
    if (e.key === 'f' || e.key === 'F') toggleFullscreen()
  }
  
  if (newShow) {
    window.addEventListener('keydown', handler)
  } else {
    window.removeEventListener('keydown', handler)
  }
})
</script>
