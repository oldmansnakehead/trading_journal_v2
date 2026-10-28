import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../components/views/DashboardView.vue')
    },
    {
      path: '/journal',
      name: 'journal',
      component: () => import('../components/views/JournalEntryForm.vue')
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../components/views/ReportsView.vue')
    },
    {
      path: '/monte-carlo',
      name: 'monte-carlo',
      component: () => import('../components/views/MonteCarloView.vue')
    },
    {
      path: '/edge',
      name: 'edge',
      component: () => import('../components/views/EdgeAnalysisView.vue')
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('../components/ui/CalendarView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../components/views/SetupSettings.vue')
    },
    {
      path: '/data',
      name: 'data',
      component: () => import('../components/views/DataManagement.vue')
    },
    {
      path: '/design',
      name: 'design',
      component: () => import('../views/DesignSystemView.vue')
    },
    // Trade Research Routes
    {
      path: '/research/entry',
      name: 'research-entry',
      component: () => import('../components/views/ResearchEntryForm.vue')
    },
    {
      path: '/research/dashboard',
      name: 'research-dashboard',
      component: () => import('../components/views/ResearchDashboardView.vue')
    },
    {
      path: '/research/settings',
      name: 'research-settings',
      component: () => import('../components/views/ResearchSettings.vue')
    }
  ]
})

export default router
