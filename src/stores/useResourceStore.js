import { defineStore } from 'pinia';

export const useResourceStore = defineStore('resource', {
  state: () => ({
    argent: 0,
    science: 0,
    carburant: 0,
    production: {
      argent: 2,
      science: 0,
      carburant: 1
    }
  }),
  actions: {
    addArgent(amount) {
      this.argent += amount;
    },
    addScience(amount) {
      this.science += amount;
    },
    addCarburant(amount) {
      this.carburant += amount;
    },
    tick(_deltaTime) {
      // _deltaTime est environ 1000ms si le tickRate est à 1000
      this.argent += this.production.argent;
      this.science += this.production.science;
      this.carburant += this.production.carburant;
    }
  }
});
