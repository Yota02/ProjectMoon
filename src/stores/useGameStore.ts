import { defineStore } from 'pinia'
import { useContractStore } from './useContractStore'
import { useResourceStore } from './useResourceStore'
import { useBaseStore } from './useBaseStore'
import { useStationStore } from './useStationStore'
import { useMissionStore } from './useMissionStore'

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
      const date = new Date(state.startDate)
      date.setDate(date.getDate() + state.elapsedDays)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    },
    currentYear: (state) => {
      const date = new Date(state.startDate)
      date.setDate(date.getDate() + state.elapsedDays)
      return date.getFullYear()
    },
  },
  actions: {
    tick(deltaTime: number) {
      this.dayTimer += deltaTime

      if (this.dayTimer >= this.msPerDay) {
        const daysToPass = Math.floor(this.dayTimer / this.msPerDay)
        this.elapsedDays += daysToPass
        this.dayTimer %= this.msPerDay

        this.applyBuildingAdjacencyBonuses(daysToPass)
        this.applyStationBonuses(daysToPass)
        this.applyStationConsumption(daysToPass)

        const missionStore = useMissionStore()
        missionStore.ensureStationResupplyMissions(this.elapsedDays)
        missionStore.refreshWeeklyMissions(this.elapsedDays)
        missionStore.runResupplyForecasts(this.currentDate, this.elapsedDays)

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
    applyBuildingAdjacencyBonuses(daysPassed: number) {
      if (daysPassed <= 0) return

      const baseStore = useBaseStore()
      const resourceStore = useResourceStore()
      const { totalArgentPerDay, totalSciencePerDay, totalCarburantPerDay } =
        baseStore.allBasesAdjacencyBonuses

      if (totalArgentPerDay !== 0) {
        resourceStore.addArgent(totalArgentPerDay * daysPassed)
      }
      if (totalSciencePerDay !== 0) {
        resourceStore.addScience(totalSciencePerDay * daysPassed)
      }
      if (totalCarburantPerDay !== 0) {
        resourceStore.addCarburant(totalCarburantPerDay * daysPassed)
      }
    },
    applyStationBonuses(daysPassed: number) {
      if (daysPassed <= 0) return

      const stationStore = useStationStore()
      const resourceStore = useResourceStore()
      const { argentPerDay, sciencePerDay, carburantPerDay } = stationStore.stationBonuses

      if (argentPerDay !== 0) {
        resourceStore.addArgent(argentPerDay * daysPassed)
      }
      if (sciencePerDay !== 0) {
        resourceStore.addScience(sciencePerDay * daysPassed)
      }
      if (carburantPerDay !== 0) {
        resourceStore.addCarburant(carburantPerDay * daysPassed)
      }
    },
    applyStationConsumption(daysPassed: number) {
      if (daysPassed <= 0) return

      const stationStore = useStationStore()
      const resourceStore = useResourceStore()
      const { nourriture, eau, o2, piecesDetachees } = stationStore.stationConsumption

      if (nourriture !== 0) {
        resourceStore.addNourriture(-nourriture * daysPassed)
      }
      if (eau !== 0) {
        resourceStore.addEau(-eau * daysPassed)
      }
      if (o2 !== 0) {
        resourceStore.addO2(-o2 * daysPassed)
      }
      if (piecesDetachees !== 0) {
        resourceStore.addPiecesDetachees(-piecesDetachees * daysPassed)
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
