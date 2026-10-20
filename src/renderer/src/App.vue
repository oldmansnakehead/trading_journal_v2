<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import AppSidebar from './components/ui/AppSidebar.vue'
import { useSidebarStore } from './stores/sidebar'

const router = useRouter()
const sidebarStore = useSidebarStore()

const updateState = ref<{
  status: string
  version?: string
  percent?: number
}>({ status: 'idle' })

let unsubUpdater: (() => void) | null = null

const goToSettingsUpdates = () => {
  router.push('/settings')
}

// Global keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar show/hide
const handleKeyDown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && (event.key === 'b' || event.key === 'B')) {
    event.preventDefault()
    sidebarStore.toggleSidebar()
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown)

  if (window.api?.updater) {
    try {
      const initial = await window.api.updater.getStatus()
      if (initial && initial.status) {
        updateState.value = {
          status: initial.status,
          version: initial.updateInfo?.version,
          percent: initial.progress?.percent
        }
      }
    } catch {
      // ignore
    }

    if (window.api.updater.onStatusChange) {
      unsubUpdater = window.api.updater.onStatusChange((state) => {
        if (state) {
          updateState.value = {
            status: state.status,
            version: state.updateInfo?.version,
            percent: state.progress?.percent
          }
        }
      })
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (unsubUpdater) {
    unsubUpdater()
  }
})
</script>

<template>
  <div class="flex flex-col md:flex-row h-screen overflow-hidden w-full bg-gray-50/50">
    <!-- Responsive Navigation: Sidebar & Mobile Drawer -->
    <AppSidebar />

    <!-- Main Content Wrapper -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Desktop Header Control Bar with Sidebar Toggle -->
      <header
        class="hidden md:flex items-center justify-between h-13 px-6 bg-white/70 backdrop-blur-xs border-b border-gray-200/80 shrink-0 z-10"
      >
        <div class="flex items-center gap-2">
          <!-- Toggle Sidebar Show / Hide Button -->
          <button
            type="button"
            @click="sidebarStore.toggleSidebar"
            data-testid="toggle-sidebar-btn"
            :title="sidebarStore.isVisible ? 'Hide Sidebar (Ctrl+B)' : 'Show Sidebar (Ctrl+B)'"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
            :class="
              sidebarStore.isVisible
                ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                : 'bg-primary/10 hover:bg-primary/15 text-primary border-primary/20'
            "
          >
            <i class="ph ph-sidebar-simple text-base text-primary"></i>
            <span>{{ sidebarStore.isVisible ? 'Hide Sidebar' : 'Show Sidebar' }}</span>
            <kbd class="hidden lg:inline-block text-[10px] bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-mono ml-0.5">Ctrl+B</kbd>
          </button>

          <!-- Collapse / Expand Mini Rail Toggle (when sidebar is shown) -->
          <button
            v-if="sidebarStore.isVisible"
            type="button"
            @click="sidebarStore.toggleCollapse"
            data-testid="toggle-collapse-btn"
            :title="sidebarStore.isCollapsed ? 'Expand Sidebar' : 'Collapse to Mini Icons'"
            class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 text-xs font-semibold transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
          >
            <i :class="sidebarStore.isCollapsed ? 'ph ph-caret-right' : 'ph ph-caret-left'" class="text-sm font-bold text-gray-500"></i>
            <span class="hidden sm:inline">{{ sidebarStore.isCollapsed ? 'Expand' : 'Collapse' }}</span>
          </button>
        </div>

        <div class="flex items-center gap-3">
          <!-- Update Indicator Badge -->
          <button
            v-if="updateState.status === 'available'"
            type="button"
            @click="goToSettingsUpdates"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            title="Click to view update details in Settings"
          >
            <i class="ph ph-sparkle text-sm text-blue-600"></i>
            <span>Update v{{ updateState.version }} Available</span>
          </button>

          <div
            v-else-if="updateState.status === 'downloading'"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-2xs"
          >
            <i class="ph ph-cloud-arrow-down text-sm text-indigo-600 animate-bounce"></i>
            <span>Downloading {{ updateState.percent || 0 }}%</span>
          </div>

          <button
            v-else-if="updateState.status === 'downloaded'"
            type="button"
            @click="goToSettingsUpdates"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-all cursor-pointer shadow-2xs animate-pulse"
            title="Update ready! Click to restart & install"
          >
            <i class="ph ph-check-circle text-sm text-emerald-600"></i>
            <span>Update Ready (Restart)</span>
          </button>

          <div class="flex items-center gap-2 text-xs font-medium text-gray-400">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Trading Journal v2</span>
          </div>
        </div>
      </header>

      <!-- Main Scrollable Content -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style>
/* Custom scrollbar for a cleaner look */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Hide sidebar scrollbar but keep functionality */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
