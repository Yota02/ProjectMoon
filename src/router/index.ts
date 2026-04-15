import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import PersonnelView from '../views/PersonnelView.vue'
import MissionsView from '../views/MissionsView.vue'
import ResearchView from '../views/ResearchView.vue'
import BaseView from '../views/BaseView.vue'
import FinanceView from '../views/FinanceView.vue'
import FleetView from '../views/FleetView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/personnel',
      name: 'personnel',
      component: PersonnelView,
    },
    {
      path: '/missions',
      name: 'missions',
      component: MissionsView,
    },
    {
      path: '/base',
      name: 'base',
      component: BaseView,
    },
    {
      path: '/fleet',
      name: 'fleet',
      component: FleetView,
    },
    {
      path: '/rd',
      name: 'rd',
      component: ResearchView,
    },
    {
      path: '/finance',
      name: 'finance',
      component: FinanceView,
    },
  ],
})

export default router
