import { defineStore } from 'pinia'

export const useResourceStore = defineStore('resource', {
  state: () => ({
    argent: 1000000000,
    science: 1000000,
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
      // 1 jour = 500ms. Si deltaTime = 1000ms, on a 2 jours écoulés.
      const daysPassed = deltaTime / 500
      this.argent += this.production.argent * daysPassed
      this.science += this.production.science * daysPassed
      this.carburant += this.production.carburant * daysPassed
    },
  },
})
