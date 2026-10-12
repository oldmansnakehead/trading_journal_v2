<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import AppSidebar from './components/ui/AppSidebar.vue'
import { useSidebarStore } from './stores/sidebar'

const sidebarStore = useSidebarStore()

// Global keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar show/hide
const handleKeyDown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && (event.key === 'b' || event.key === 'B')) {
    event.preventDefault()
    sidebarStore.toggleSidebar()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
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

        <div class="flex items-center gap-2 text-xs font-medium text-gray-400">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Trading Journal v2</span>
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
