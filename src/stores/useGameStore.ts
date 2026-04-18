import { defineStore } from 'pinia'
import { gameEvents } from '@/engine/EventBus'
import { gameLoop } from '@/engine/GameLoop'

export const useGameStore = defineStore('game', {
  state: () => ({
    startDate: new Date(2014, 0, 1), // 1er Janvier 2014
    elapsedDays: 0,
    msPerDay: 500, // 0.5s = 1 jour (Vitesse x1)
    gameSpeed: 1, // 0=Pause, 1=x1, 2=x2, 5=x5
    dayTimer: 0,
    spaceRaceStartYear: 2018,
    isSpaceRaceActive: false,
    lastMonthDay: 0,
    lastSavedTime: Date.now(),
    orbitalDebris: 0, // 0 to 100%
    debrisFineThreshold: 60, // A partir de 60%, risque d'amende
    hype: 20, // 0 to 100%
    lastYearDay: 0,
  }),
  getters: {
    debrisPenalty: (state) => {
      // Chaque 10% de débris réduit la chance de succès de 2%
      return (state.orbitalDebris / 10) * 0.02
    },
    hypeBonus: (state) => {
      // Chaque 20% de hype ajoute 1% de chance de succès (bonus d'attention/financement)
      return (state.hype / 20) * 0.01
    },
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
    setGameSpeed(speed: number) {
      this.gameSpeed = speed
      if (speed === 0) {
        gameLoop.stop()
      } else {
        const newTickRate = this.msPerDay / speed
        gameLoop.setTickRate(newTickRate)
        gameLoop.start()
      }
      gameEvents.emit('speed-changed', { speed })
    },
    initOfflineProgress() {
      const now = Date.now()
      if (this.lastSavedTime) {
        const offlineTime = now - this.lastSavedTime
        // Cap offline progression to 7 days maximum to avoid performance freezes/economy breaking
        const maxOfflineMs = 7 * 24 * 60 * 60 * 1000 // 7 jours reels max d'AFK
        const timeToProcess = Math.min(offlineTime, maxOfflineMs)

        if (timeToProcess > 0) {
          console.log(`[Game] Rétrapage hors-ligne de ${timeToProcess}ms`)
          this.tick(timeToProcess)
        }
      }
      this.lastSavedTime = Date.now()
    },
    tick(deltaTime: number) {
      this.dayTimer += deltaTime
      this.lastSavedTime = Date.now()

      // Emit the raw tick event if something needs per-frame timing
      gameEvents.emit('tick', { deltaTime })

      if (this.dayTimer >= this.msPerDay) {
        const daysToPass = Math.floor(this.dayTimer / this.msPerDay)
        this.elapsedDays += daysToPass
        this.dayTimer %= this.msPerDay

        // --- DECOUPLED GAME LOOP ---
        // Instead of calling all other stores manually, we just notify "A day has passed"
        gameEvents.emit('day-elapsed', {
          daysPassed: daysToPass,
          elapsedDays: this.elapsedDays,
          currentDate: this.currentDate,
        })

        const currentMonth = Math.floor(this.elapsedDays / 30)
        const lastMonth = Math.floor(this.lastMonthDay / 30)

        if (currentMonth > lastMonth) {
          this.lastMonthDay = this.elapsedDays

          this.checkDebrisFines()

          gameEvents.emit('month-elapsed', {
            currentMonth,
            lastMonthDay: this.lastMonthDay,
          })
        }

        const currentYearNum = Math.floor(this.elapsedDays / 365)
        const lastYearNum = Math.floor(this.lastYearDay / 365)

        if (currentYearNum > lastYearNum) {
          this.lastYearDay = this.elapsedDays
          gameEvents.emit('year-elapsed', {
            currentYear: currentYearNum,
            elapsedDays: this.elapsedDays
          })
        }

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
      this.isSpaceRaceActive = true
      gameEvents.emit('space-race-started', {})
    },
    addOrbitalDebris(amount: number) {
      this.orbitalDebris = Math.min(100, Math.max(0, this.orbitalDebris + amount))
    },
    addHype(amount: number) {
      this.hype = Math.min(100, Math.max(0, this.hype + amount))
    },
    async checkDebrisFines() {
      if (this.orbitalDebris > this.debrisFineThreshold) {
        // 5% de chance par mois de prendre une amende si au dessus du seuil
        if (Math.random() < 0.05) {
          const fineAmount = 500000 + (this.orbitalDebris - this.debrisFineThreshold) * 50000
          
          const { useResourceStore } = await import('./useResourceStore')
          const { useMissionStore } = await import('./useMissionStore')
          const resourceStore = useResourceStore()
          const missionStore = useMissionStore()
          
          resourceStore.addArgent(-fineAmount)
          missionStore.log(`[ENVIRONNEMENT] Amende : -${Math.round(fineAmount).toLocaleString()} € pour encombrement orbital (${Math.round(this.orbitalDebris)}%).`)
        }
      }
    }
  },

})
