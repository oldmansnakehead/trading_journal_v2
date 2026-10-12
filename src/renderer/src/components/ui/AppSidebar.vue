<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isMobileOpen = ref(false)

const openMobile = () => {
  isMobileOpen.value = true
}

const closeMobile = () => {
  isMobileOpen.value = false
}

// Close drawer on Escape key
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isMobileOpen.value) {
    closeMobile()
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
      @click="openMobile"
      data-testid="mobile-menu-btn"
      aria-label="Open Navigation Menu"
      class="p-2 rounded-xl text-textSecondary hover:text-textPrimary hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
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
      v-if="isMobileOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
      @click="closeMobile"
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
      v-if="isMobileOpen"
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
          @click="closeMobile"
          data-testid="close-menu-btn"
          aria-label="Close Navigation Menu"
          class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
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
            @click="closeMobile"
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
            @click="closeMobile"
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
    class="w-64 lg:w-72 flex-shrink-0 bg-white border-r border-gray-200 border-dashed h-full hidden md:flex flex-col z-20"
  >
    <!-- Logo Area -->
    <div class="h-20 flex items-center px-6">
      <div class="flex items-center gap-2 cursor-pointer">
        <div
          class="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-xl"
        >
          M.
        </div>
        <span class="font-bold text-lg tracking-tight text-textPrimary">Trading Journal</span>
      </div>
    </div>

    <!-- Scrollable Menu -->
    <div class="flex-1 overflow-y-auto no-scrollbar px-4 pb-8">
      <div class="mb-4 mt-2 px-2 text-xs font-bold text-textSecondary uppercase tracking-wider">
        Overview
      </div>

      <nav class="space-y-1">
        <router-link
          v-for="item in overviewNav"
          :key="item.to"
          :to="item.to"
          active-class="bg-primary/10 text-primary font-semibold"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-textSecondary hover:bg-gray-100 hover:text-textPrimary font-medium transition-colors"
        >
          <i :class="[item.icon, 'text-xl']"></i>
          <span>{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="mt-8 mb-4 px-2 text-xs font-bold text-textSecondary uppercase tracking-wider">
        Management
      </div>

      <nav class="space-y-1">
        <router-link
          v-for="item in managementNav"
          :key="item.to"
          :to="item.to"
          active-class="bg-primary/10 text-primary font-semibold"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-textSecondary hover:bg-gray-100 hover:text-textPrimary font-medium transition-colors"
        >
          <i :class="[item.icon, 'text-xl']"></i>
          <span>{{ item.name }}</span>
        </router-link>
      </nav>
    </div>
  </aside>
</template>
