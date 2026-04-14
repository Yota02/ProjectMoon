import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import PersonnelView from '../views/PersonnelView.vue'
import MissionsView from '../views/MissionsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/personnel',
      name: 'personnel',
      component: PersonnelView
    },
    {
      path: '/missions',
      name: 'missions',
      component: MissionsView
    },
    {
      path: '/fleet',
      name: 'fleet',
      component: DashboardView // Placeholder
    },
    {
      path: '/rd',
      name: 'rd',
      component: DashboardView // Placeholder
    },
    {
      path: '/finance',
      name: 'finance',
      component: DashboardView // Placeholder
    }
  ],
})

export default router
