import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/design',
      name: 'design',
      component: () => import('../views/DesignSystemView.vue')
    }
  ]
})

export default router
