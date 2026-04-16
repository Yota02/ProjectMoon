import { defineStore } from 'pinia'
import { useFleetStore } from './useFleetStore'

const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'test'

export const useResourceStore = defineStore('resource', {
  state: () => ({
    argent: isDebugMode ? Infinity : 1000000000,
    science: isDebugMode ? Infinity : 1000000,
    carburant: 0,
    nourriture: 100,
    eau: 100,
    o2: 100,
    piecesDetachees: 50,
    production: {
      argent: 2,
      science: 0,
      carburant: 1,
      nourriture: 0,
      eau: 0,
      o2: 0,
      piecesDetachees: 0,
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
    addNourriture(amount: number) {
      this.nourriture += amount
    },
    addEau(amount: number) {
      this.eau += amount
    },
    addO2(amount: number) {
      this.o2 += amount
    },
    addPiecesDetachees(amount: number) {
      this.piecesDetachees += amount
    },
    // Nouvelle action pour acheter du carburant avec de l'argent
    buyCarburant(amount: number) {
      const fleetStore = useFleetStore()
      // Prix de base du carburant: 100 unités d'argent par unité de carburant
      const pricePerUnit = 100
      const totalCost = amount * pricePerUnit

      if (this.argent >= totalCost) {
        this.addArgent(-totalCost)
        this.addCarburant(amount)
        return true
      }
      return false
    },
    tick(deltaTime: number) {
      const daysPassed = deltaTime / 500
      this.science += this.production.science * daysPassed
      this.carburant += this.production.carburant * daysPassed
      this.nourriture += this.production.nourriture * daysPassed
      this.eau += this.production.eau * daysPassed
      this.o2 += this.production.o2 * daysPassed
      this.piecesDetachees += this.production.piecesDetachees * daysPassed
    },
  },
})
