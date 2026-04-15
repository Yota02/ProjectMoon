import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import PersonnelView from '../views/PersonnelView.vue'
import MissionsView from '../views/MissionsView.vue'
import ResearchView from '../views/ResearchView.vue'
import BaseView from '../views/BaseView.vue'
import FinanceView from '../views/FinanceView.vue'
import FleetView from '../views/FleetView.vue'
import TrainingView from '../views/TrainingView.vue'
import SolarSystemView from '../views/SolarSystemView.vue'
import StationsView from '../views/StationsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/solar',
      name: 'système solaire',
      component: SolarSystemView,
    },
    {
      path: '/stations',
      name: 'stations',
      component: StationsView,
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
    {
      path: '/training',
      name: 'training',
      component: TrainingView,
    },
  ],
})

export default router
