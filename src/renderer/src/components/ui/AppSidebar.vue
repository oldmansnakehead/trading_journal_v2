<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useSidebarStore } from '../../stores/sidebar'

const sidebarStore = useSidebarStore()

// Handle global keyboard shortcuts:
// - Escape: close mobile drawer
// - Ctrl+B or Cmd+B: toggle sidebar visibility
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && sidebarStore.isMobileOpen) {
    sidebarStore.closeMobile()
  } else if ((event.ctrlKey || event.metaKey) && (event.key === 'b' || event.key === 'B')) {
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

interface NavItem {
  name: string
  to: string
  icon: string
}

const overviewNav: NavItem[] = [
  { name: 'Dashboard', to: '/', icon: 'ph ph-app-window' },
  { name: 'Win/Loss Report', to: '/reports', icon: 'ph ph-chart-pie' },
  { name: 'Monte Carlo', to: '/monte-carlo', icon: 'ph ph-dice-five' },
  { name: 'Edge Analysis', to: '/edge', icon: 'ph ph-crosshair' },
  { name: 'Calendar', to: '/calendar', icon: 'ph ph-calendar' },
  { name: 'New Trade', to: '/journal', icon: 'ph ph-plus-circle' }
]

const managementNav: NavItem[] = [
  { name: 'Data Management', to: '/data', icon: 'ph ph-database' },
  { name: 'Settings', to: '/settings', icon: 'ph ph-gear' }
]
</script>

<template>
  <!-- Mobile Top Header (< 768px) -->
  <header
    class="md:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200 z-30 shrink-0 w-full select-none"
  >
    <div class="flex items-center gap-2 cursor-pointer">
      <div
        class="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-base"
      >
        M.
      </div>
      <span class="font-bold text-base tracking-tight text-textPrimary">Trading Journal</span>
    </div>

    <button
      type="button"
      @click="sidebarStore.openMobile"
      data-testid="mobile-menu-btn"
      aria-label="Open Navigation Menu"
      class="p-2 rounded-xl text-textSecondary hover:text-textPrimary hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
    >
      <i class="ph ph-list text-2xl"></i>
    </button>
  </header>

  <!-- Mobile Drawer Backdrop -->
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="sidebarStore.isMobileOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
      @click="sidebarStore.closeMobile"
    ></div>
  </Transition>

  <!-- Mobile Drawer Menu Panel -->
  <Transition
    enter-active-class="transition-transform duration-200 ease-out"
    enter-from-class="-translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-150 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="-translate-x-full"
  >
    <aside
      v-if="sidebarStore.isMobileOpen"
      data-testid="mobile-drawer"
      class="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col md:hidden"
    >
      <!-- Mobile Drawer Header -->
      <div class="h-16 flex items-center justify-between px-6 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <div
            class="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-lg"
          >
            M.
          </div>
          <span class="font-bold text-base tracking-tight text-textPrimary">Trading Journal</span>
        </div>
        <button
          type="button"
          @click="sidebarStore.closeMobile"
          data-testid="close-menu-btn"
          aria-label="Close Navigation Menu"
          class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <i class="ph ph-x text-xl"></i>
        </button>
      </div>

      <!-- Mobile Menu Links -->
      <div class="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
        <div class="mb-3 px-2 text-xs font-bold text-textSecondary uppercase tracking-wider">
          Overview
        </div>
        <nav class="space-y-1">
          <router-link
            v-for="item in overviewNav"
            :key="item.to"
            :to="item.to"
            @click="sidebarStore.closeMobile"
            active-class="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-textSecondary hover:bg-gray-100 hover:text-textPrimary font-medium transition-colors"
          >
            <i :class="[item.icon, 'text-xl']"></i>
            <span>{{ item.name }}</span>
          </router-link>
        </nav>

        <div class="mt-6 mb-3 px-2 text-xs font-bold text-textSecondary uppercase tracking-wider">
          Management
        </div>
        <nav class="space-y-1">
          <router-link
            v-for="item in managementNav"
            :key="item.to"
            :to="item.to"
            @click="sidebarStore.closeMobile"
            active-class="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-textSecondary hover:bg-gray-100 hover:text-textPrimary font-medium transition-colors"
          >
            <i :class="[item.icon, 'text-xl']"></i>
            <span>{{ item.name }}</span>
          </router-link>
        </nav>
      </div>
    </aside>
  </Transition>

  <!-- Desktop & Tablet Sidebar (>= 768px, including initial 900px) -->
  <aside
    data-testid="app-desktop-sidebar"
    :class="[
      'flex-shrink-0 bg-white border-r border-gray-200 border-dashed h-full hidden md:flex flex-col z-20 transition-all duration-300 ease-in-out overflow-hidden select-none',
      !sidebarStore.isVisible
        ? 'w-0 -translate-x-full opacity-0 pointer-events-none !border-r-0'
        : sidebarStore.isCollapsed
          ? 'w-20 translate-x-0 opacity-100'
          : 'w-64 lg:w-72 translate-x-0 opacity-100'
    ]"
  >
    <!-- Logo Area & Sidebar Toggle Controls -->
    <div
      class="h-16 flex items-center border-b border-gray-100/80 shrink-0 select-none"
      :class="sidebarStore.isCollapsed ? 'justify-center px-2' : 'justify-between px-4'"
    >
      <div
        class="flex items-center gap-2.5 min-w-0 cursor-pointer"
        :title="sidebarStore.isCollapsed ? 'Trading Journal' : undefined"
        @click="sidebarStore.isCollapsed && sidebarStore.toggleCollapse()"
      >
        <div
          class="w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs"
        >
          M.
        </div>
        <span
          v-if="!sidebarStore.isCollapsed"
          class="font-bold text-sm tracking-tight text-textPrimary whitespace-nowrap"
        >
          Trading Journal
        </span>
      </div>

      <!-- Action Buttons (Visible when expanded) -->
      <div v-if="!sidebarStore.isCollapsed" class="flex items-center gap-1 shrink-0">
        <!-- Collapse to Mini Rail Button -->
        <button
          type="button"
          @click="sidebarStore.toggleCollapse"
          data-testid="collapse-sidebar-btn"
          title="Collapse to icons"
          class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <i class="ph ph-caret-left text-base"></i>
        </button>

        <!-- Hide Sidebar Button -->
        <button
          type="button"
          @click="sidebarStore.toggleSidebar"
          data-testid="sidebar-toggle-btn"
          title="Hide Sidebar (Ctrl+B)"
          class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <i class="ph ph-sidebar-simple text-base"></i>
        </button>
      </div>

      <!-- Expand Mini Rail Button (Visible when collapsed) -->
      <button
        v-else
        type="button"
        @click="sidebarStore.toggleCollapse"
        data-testid="expand-sidebar-btn"
        title="Expand Sidebar"
        class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer mt-1"
      >
        <i class="ph ph-caret-right text-base"></i>
      </button>
    </div>

    <!-- Scrollable Menu -->
    <div
      class="flex-1 overflow-y-auto no-scrollbar pb-6"
      :class="sidebarStore.isCollapsed ? 'px-2' : 'px-4'"
    >
      <!-- Overview Section -->
      <div
        v-if="!sidebarStore.isCollapsed"
        class="mb-4 mt-4 px-2 text-xs font-bold text-textSecondary uppercase tracking-wider whitespace-nowrap"
      >
        Overview
      </div>
      <hr v-else class="my-3 border-gray-100" />

      <nav class="space-y-1">
        <router-link
          v-for="item in overviewNav"
          :key="item.to"
          :to="item.to"
          :title="sidebarStore.isCollapsed ? item.name : undefined"
          active-class="bg-primary/10 text-primary font-semibold"
          :class="[
            'flex items-center rounded-xl text-textSecondary hover:bg-gray-100 hover:text-textPrimary font-medium transition-colors',
            sidebarStore.isCollapsed
              ? 'justify-center p-3 text-2xl'
              : 'gap-3 px-3 py-2.5 text-base'
          ]"
        >
          <i :class="[item.icon, sidebarStore.isCollapsed ? 'text-2xl' : 'text-xl']"></i>
          <span v-if="!sidebarStore.isCollapsed" class="whitespace-nowrap">{{ item.name }}</span>
        </router-link>
      </nav>

      <!-- Management Section -->
      <div
        v-if="!sidebarStore.isCollapsed"
        class="mt-8 mb-4 px-2 text-xs font-bold text-textSecondary uppercase tracking-wider whitespace-nowrap"
      >
        Management
      </div>
      <hr v-else class="my-3 border-gray-100" />

      <nav class="space-y-1">
        <router-link
          v-for="item in managementNav"
          :key="item.to"
          :to="item.to"
          :title="sidebarStore.isCollapsed ? item.name : undefined"
          active-class="bg-primary/10 text-primary font-semibold"
          :class="[
            'flex items-center rounded-xl text-textSecondary hover:bg-gray-100 hover:text-textPrimary font-medium transition-colors',
            sidebarStore.isCollapsed
              ? 'justify-center p-3 text-2xl'
              : 'gap-3 px-3 py-2.5 text-base'
          ]"
        >
          <i :class="[item.icon, sidebarStore.isCollapsed ? 'text-2xl' : 'text-xl']"></i>
          <span v-if="!sidebarStore.isCollapsed" class="whitespace-nowrap">{{ item.name }}</span>
        </router-link>
      </nav>
    </div>

    <!-- Desktop Sidebar Footer -->
    <div
      v-if="!sidebarStore.isCollapsed"
      class="p-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 shrink-0"
    >
      <span>Toggle Shortcut</span>
      <kbd class="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 font-mono">Ctrl+B</kbd>
    </div>
  </aside>
</template>
