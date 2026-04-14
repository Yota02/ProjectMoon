import { defineStore } from 'pinia'
import { useContractStore } from './useContractStore'
import { useResourceStore } from './useResourceStore'

export const useGameStore = defineStore('game', {
  state: () => ({
    startDate: new Date(2014, 0, 1), // 1er Janvier 2014
    elapsedDays: 0,
    msPerDay: 500, // 0.5s = 1 jour
    dayTimer: 0,
    spaceRaceStartYear: 2018,
    isSpaceRaceActive: false,
    lastMonthDay: 0,
  }),
  getters: {
    currentDate: (state) => {
      const date = new Date(state.startDate)
      date.setDate(date.getDate() + state.elapsedDays)
      return date
    },
    formattedDate: (state) => {
      const date = state.currentDate
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    },
    currentYear: (state) => state.currentDate.getFullYear(),
  },
  actions: {
    tick(deltaTime: number) {
      this.dayTimer += deltaTime

      if (this.dayTimer >= this.msPerDay) {
        const daysToPass = Math.floor(this.dayTimer / this.msPerDay)
        this.elapsedDays += daysToPass
        this.dayTimer %= this.msPerDay

        const currentMonth = Math.floor(this.elapsedDays / 30)
        const lastMonth = Math.floor(this.lastMonthDay / 30)

        if (currentMonth > lastMonth) {
          this.lastMonthDay = this.elapsedDays
          this.payMonthlyRevenue()
        }

        this.checkEvents()
      }
    },
    payMonthlyRevenue() {
      const contractStore = useContractStore()
      const resourceStore = useResourceStore()
      const monthlyRevenue = contractStore.totalMonthlyRevenue
      if (monthlyRevenue > 0) {
        resourceStore.addArgent(monthlyRevenue * 1000000)
      }
    },
    checkEvents() {
      // Check for space race trigger
      if (this.currentYear >= this.spaceRaceStartYear && !this.isSpaceRaceActive) {
        this.triggerSpaceRace()
      }
    },
    triggerSpaceRace() {
      const contractStore = useContractStore()
      this.isSpaceRaceActive = true
      contractStore.triggerEvent('spaceRace')
    },
  },
})
