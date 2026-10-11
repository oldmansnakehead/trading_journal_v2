<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="flex h-screen overflow-hidden w-full">
    <!-- 1. Layout Elements: Sidebar -->
    <aside
      class="w-72 flex-shrink-0 bg-white border-r border-gray-200 border-dashed h-full hidden lg:flex flex-col z-20"
    >
      <!-- Logo Area -->
      <div class="h-20 flex items-center px-6">
        <div class="flex items-center gap-2 cursor-pointer">
          <div
            class="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-xl"
          >
            M.
          </div>
          <span class="font-bold text-lg tracking-tight">Trading Journal</span>
        </div>
      </div>

      <!-- Scrollable Menu -->
      <div class="flex-1 overflow-y-auto no-scrollbar px-4 pb-8">
        <div class="mb-4 mt-2 px-2 text-xs font-bold text-textSecondary uppercase tracking-wider">
          Overview
        </div>

        <nav class="space-y-1">
          <router-link
            to="/"
            active-class="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-textSecondary hover:bg-gray-100 hover:text-textPrimary font-medium transition-colors"
          >
            <i class="ph ph-app-window text-xl"></i>
            <span>Dashboard</span>
          </router-link>
          <router-link
            to="/reports"
            active-class="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-textSecondary hover:bg-gray-100 hover:text-textPrimary font-medium transition-colors"
          >
            <i class="ph ph-chart-pie text-xl"></i>
            <span>Win/Loss Report</span>
          </router-link>
          <router-link
            to="/calendar"
            active-class="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-textSecondary hover:bg-gray-100 hover:text-textPrimary font-medium transition-colors"
          >
            <i class="ph ph-calendar text-xl"></i>
            <span>Calendar</span>
          </router-link>
          <router-link
            to="/journal"
            active-class="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-textSecondary hover:bg-gray-100 hover:text-textPrimary font-medium transition-colors"
          >
            <i class="ph ph-plus-circle text-xl"></i>
            <span>New Trade</span>
          </router-link>
        </nav>

        <div class="mt-8 mb-4 px-2 text-xs font-bold text-textSecondary uppercase tracking-wider">
          Management
        </div>

        <nav class="space-y-1">
          <router-link
            to="/data"
            active-class="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-textSecondary hover:bg-gray-100 hover:text-textPrimary font-medium transition-colors"
          >
            <i class="ph ph-database text-xl"></i>
            <span>Data Management</span>
          </router-link>
          <router-link
            to="/settings"
            active-class="bg-primary/10 text-primary font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-textSecondary hover:bg-gray-100 hover:text-textPrimary font-medium transition-colors"
          >
            <i class="ph ph-gear text-xl"></i>
            <span>Settings</span>
          </router-link>
        </nav>
      </div>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
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
