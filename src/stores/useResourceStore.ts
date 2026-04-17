import { defineStore } from 'pinia'

const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'test'

export const useResourceStore = defineStore('resource', {
  state: () => ({
    argent: isDebugMode ? 999000000000 : 1000000,
    science: isDebugMode ? 999000000 : 100,
    carburant: 0,
    nourriture: 50,
    eau: 50,
    o2: 50,
    piecesDetachees: 10,
    carburantPriceBase: 100,
    carburantPriceMultiplier: 1,
    carburantPriceMultiplierDuration: 0, // en jours
    marketCrashMultiplier: 1, // Réduit les gains d'argent après l'extraction astéroïdale
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
  getters: {
    currentCarburantPrice: (state) => Math.round(state.carburantPriceBase * state.carburantPriceMultiplier),
  },
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
    setCarburantPriceMultiplier(multiplier: number, duration: number) {
      this.carburantPriceMultiplier = multiplier
      this.carburantPriceMultiplierDuration = duration
    },
    applyMarketCrash() {
      this.marketCrashMultiplier = 0.4 // Réduction de 60% des gains
    },
    // Nouvelle action pour acheter du carburant avec de l'argent
    buyCarburant(amount: number) {
      const totalCost = amount * this.currentCarburantPrice

      if (this.argent >= totalCost) {
        this.addArgent(-totalCost)
        this.addCarburant(amount)
        return true
      }
      return false
    },
    tick(deltaTime: number) {
      const daysPassed = deltaTime / 500
      
      // Gérer la durée du multiplicateur de prix
      if (this.carburantPriceMultiplierDuration > 0) {
        this.carburantPriceMultiplierDuration -= daysPassed
        if (this.carburantPriceMultiplierDuration <= 0) {
          this.carburantPriceMultiplierDuration = 0
          this.carburantPriceMultiplier = 1
        }
      }

      this.science += this.production.science * daysPassed
      this.carburant += this.production.carburant * daysPassed
      this.nourriture += this.production.nourriture * daysPassed
      this.eau += this.production.eau * daysPassed
      this.o2 += this.production.o2 * daysPassed
      this.piecesDetachees += this.production.piecesDetachees * daysPassed
    },
  },

})
