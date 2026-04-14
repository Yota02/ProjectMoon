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
    tick(_deltaTime: number) {
      // _deltaTime est environ 1000ms si le tickRate est à 1000
      this.argent += this.production.argent
      this.science += this.production.science
      this.carburant += this.production.carburant
    },
  },
})
