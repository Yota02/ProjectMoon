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

          gameEvents.emit('month-elapsed', {
            currentMonth,
            lastMonthDay: this.lastMonthDay,
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
  },
  persist: true,
})
