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
    }
  ]
})

export default router
