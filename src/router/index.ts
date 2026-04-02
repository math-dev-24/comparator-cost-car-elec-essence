import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'SimulatorView',
      component: () => import('@/views/SimulatorView.vue'),
    },
  ],
})

export default router
