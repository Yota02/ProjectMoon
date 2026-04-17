import { defineStore } from 'pinia'
import { useResourceStore } from './useResourceStore'

const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'test'

export type StaffRole = 'ingenieur' | 'scientifique' | 'constructeur'

interface StaffProfile {
  label: string
  count: number
  hiringCost: number
  description: string
}

export interface PersonnelLog {
  temps: string
  message: string
}

export const usePersonnelStore = defineStore('personnel', {
  state: () => ({
    staff: {
      ingenieur: {
        label: 'Ingenieur',
        count: isDebugMode ? 1 : 0,
        hiringCost: 120,
        description: 'Permet de lancer des missions et augmente les chances de succes.',
      },
      scientifique: {
        label: 'Scientifique',
        count: isDebugMode ? 1 : 0,
        hiringCost: 160,
        description: 'Ajoute +1/s de production de science a chaque embauche.',
      },
      constructeur: {
        label: 'Constructeur',
        count: isDebugMode ? 1 : 0,
        hiringCost: 140,
        description: 'Debloque la construction des raffineries de carburant.',
      },
    } as Record<StaffRole, StaffProfile>,
    raffineries: 0,
    logs: [] as PersonnelLog[],
  }),
  getters: {
    hasIngenieur: (state) => state.staff.ingenieur.count > 0,
    hasScientifique: (state) => state.staff.scientifique.count > 0,
    hasConstructeur: (state) => state.staff.constructeur.count > 0,
    missionSuccessBonus: (state) => Math.min(0.25, state.staff.ingenieur.count * 0.05),
    refineryCost: (state) => ({
      argent: 200 + state.raffineries * 100,
      carburant: 30 + state.raffineries * 10,
    }),
  },
  actions: {
    hire(role: StaffRole) {
      const resourceStore = useResourceStore()
      const target = this.staff[role]

      if (resourceStore.argent < target.hiringCost) {
        this.log(`[ERREUR] Fonds insuffisants pour embaucher un ${target.label}.`)
        return false
      }

      resourceStore.addArgent(-target.hiringCost)
      target.count += 1
      target.hiringCost = Math.round(target.hiringCost * 1.25)

      if (role === 'scientifique') {
        resourceStore.production.science += 1
      }

      this.log(`[EQUIPE] ${target.label} embauche. Effectif: ${target.count}.`)
      return true
    },

    runResearchProtocol() {
      const resourceStore = useResourceStore()



      const cost = { argent: 80, carburant: 15 }
      if (resourceStore.argent < cost.argent || resourceStore.carburant < cost.carburant) {
        this.log('[ERREUR] Ressources insuffisantes pour lancer le protocole scientifique.')
        return false
      }

      const reward = 60 + this.staff.scientifique.count * 10
      resourceStore.addArgent(-cost.argent)
      resourceStore.addCarburant(-cost.carburant)
      resourceStore.addScience(reward)

      this.log(`[SCIENCE] Protocole termine: +${reward} Science.`)
      return true
    },

    buildRefinery() {
      const resourceStore = useResourceStore()



      const cost = this.refineryCost
      if (resourceStore.argent < cost.argent || resourceStore.carburant < cost.carburant) {
        this.log('[ERREUR] Ressources insuffisantes pour la nouvelle raffinerie.')
        return false
      }

      resourceStore.addArgent(-cost.argent)
      resourceStore.addCarburant(-cost.carburant)
      resourceStore.production.carburant += 1
      this.raffineries += 1

      this.log(
        `[INFRA] Raffinerie construite. Production carburant: +${resourceStore.production.carburant}/s.`,
      )
      return true
    },

    log(message: string) {
      this.logs.unshift({ temps: new Date().toLocaleTimeString(), message })
      if (this.logs.length > 10) this.logs.pop()
    },
  },

})
