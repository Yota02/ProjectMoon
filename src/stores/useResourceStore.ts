import { defineStore } from 'pinia'

const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'test'

export const useResourceStore = defineStore('resource', {
  state: () => ({
    argent: isDebugMode ? Infinity : 1000000000,
    science: isDebugMode ? Infinity : 1000000,
    carburant: 0,
    production: {
      argent: 2,
      science: 0,
      carburant: 1,
    },
  }),
  actions: {
    addArgent(amount: number) {
      this.argent += amount
    },
    addScience(amount: number) {
      this.science += amount
    },
    addCarburant(amount: number) {
      this.carburant += amount
    },
    tick(deltaTime: number) {
      const daysPassed = deltaTime / 500
      this.science += this.production.science * daysPassed
      this.carburant += this.production.carburant * daysPassed
    },
  },
})
