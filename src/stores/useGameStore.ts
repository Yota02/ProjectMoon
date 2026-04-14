import { defineStore } from 'pinia'
import { useContractStore } from './useContractStore'

export const useGameStore = defineStore('game', {
  state: () => ({
    startDate: new Date(2014, 0, 1), // 1er Janvier 2014
    elapsedDays: 0,
    msPerDay: 500, // 0.5s = 1 jour
    dayTimer: 0,
    spaceRaceStartYear: 2018,
    isSpaceRaceActive: false,
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
        
        this.checkEvents()
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
    }
  }
})
