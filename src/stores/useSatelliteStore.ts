import { defineStore } from 'pinia'
import { useResourceStore } from './useResourceStore'
import { useResearchStore } from './useResearchStore'
import { useGameStore } from './useGameStore'
import { type OrbitType } from './useFleetStore'

export type SatelliteType = 'Communication' | 'Science' | 'Navigation' | 'Observation'
export type SatelliteStatus = 'En Construction' | 'Prêt' | 'En Orbite' | 'Désactivé'

export interface SatelliteComponent {
  id: string
  name: string
  description: string
  type: 'chassis' | 'power' | 'instrument' | 'propulsion'
  cost: number
  scienceCost: number
  mass: number
  powerGeneration?: number
  powerConsumption?: number
  bonusType?: SatelliteType
  bonusValue?: number
  unlockResearchId?: string
}

export interface SatelliteDesign {
  id: string
  name: string
  chassisId: string
  powerId: string
  propulsionId: string
  instrumentIds: string[]
  totalCost: number
  totalMass: number
  totalPowerBalance: number
}

export interface ActiveSatellite {
  id: string
  designId: string
  name: string
  status: SatelliteStatus
  orbit: OrbitType
  bodyId: string
  constellationId?: string
  health: number // 0 to 100
  deployedDate: number
}

export interface Constellation {
  id: string
  name: string
  type: SatelliteType
  bodyId: string
  satellitesCount: number
  totalBonus: number
  color: string
}

export const useSatelliteStore = defineStore('satellite', {
  state: () => ({
    components: [
      // ... (keep components same)
      // CHASSIS
      {
        id: 'c-nano',
        name: 'Châssis Nano (Cubesat)',
        description: 'Petit et léger, limité à 1 instrument.',
        type: 'chassis',
        cost: 150000,
        scienceCost: 10,
        mass: 50,
        unlockResearchId: 'l-micro',
      },
      {
        id: 'c-micro',
        name: 'Châssis Micro',
        description: 'Polyvalent, peut accueillir 2 instruments.',
        type: 'chassis',
        cost: 500000,
        scienceCost: 30,
        mass: 250,
        unlockResearchId: 'l-medium',
      },
      {
        id: 'c-heavy',
        name: 'Bus Satellite Lourd',
        description: 'Plateforme massive pour 4 instruments.',
        type: 'chassis',
        cost: 2000000,
        scienceCost: 100,
        mass: 1200,
        unlockResearchId: 'l-heavy',
      },
      // POWER
      {
        id: 'p-solar-small',
        name: 'Panneaux Solaires Standards',
        description: 'Énergie propre et fiable pour petits satellites.',
        type: 'power',
        cost: 50000,
        scienceCost: 5,
        mass: 20,
        powerGeneration: 50,
      },
      {
        id: 'p-solar-large',
        name: 'Panneaux Haute Efficacité',
        description: 'Grande surface de captation pour missions gourmandes.',
        type: 'power',
        cost: 200000,
        scienceCost: 25,
        mass: 100,
        powerGeneration: 250,
      },
      {
        id: 'p-rtg',
        name: 'Générateur RTG',
        description: 'Énergie constante même loin du soleil (Pluton, Mars).',
        type: 'power',
        cost: 1500000,
        scienceCost: 150,
        mass: 80,
        powerGeneration: 150,
        unlockResearchId: 'm-nucleaire',
      },
      // PROPULSION
      {
        id: 'm-cold-gas',
        name: 'Gaz Froid',
        description: 'Simple et fiable pourajustements orbitaux mineurs.',
        type: 'propulsion',
        cost: 30000,
        scienceCost: 0,
        mass: 40,
      },
      {
        id: 'm-chemical',
        name: 'Propulsion Chimique',
        description: 'Poussée forte pour changements d\'orbite rapides.',
        type: 'propulsion',
        cost: 100000,
        scienceCost: 10,
        mass: 150,
        unlockResearchId: 'm-chimique',
      },
      {
        id: 'm-ion',
        name: 'Propulseur Ionique',
        description: 'Efficacité maximale, mais poussée très faible.',
        type: 'propulsion',
        cost: 800000,
        scienceCost: 200,
        mass: 120,
        unlockResearchId: 'm-ionique',
      },
      // INSTRUMENTS
      {
        id: 'i-comms-1',
        name: 'Antenne Comm Mk1',
        description: 'Fournit des services de télécommunication basiques.',
        type: 'instrument',
        cost: 120000,
        scienceCost: 20,
        mass: 60,
        powerConsumption: 40,
        bonusType: 'Communication',
        bonusValue: 500, // Argent / jour
        unlockResearchId: 'i-sat',
      },
      {
        id: 'i-science-1',
        name: 'Spectromètre',
        description: 'Analyse la composition atmosphérique ou stellaire.',
        type: 'instrument',
        cost: 250000,
        scienceCost: 50,
        mass: 120,
        powerConsumption: 80,
        bonusType: 'Science',
        bonusValue: 0.2, // Science / jour
        unlockResearchId: 'b-labo',
      },
      {
        id: 'i-nav-1',
        name: 'Émetteur GNSS',
        description: 'Aide à la navigation et au positionnement global.',
        type: 'instrument',
        cost: 400000,
        scienceCost: 80,
        mass: 180,
        powerConsumption: 120,
        bonusType: 'Navigation',
        bonusValue: 1, // % de réussite mission
        unlockResearchId: 'i-guidage',
      },
    ] as SatelliteComponent[],
    designs: [] as SatelliteDesign[],
    activeSatellites: [] as ActiveSatellite[],
    constellations: [
      { id: 'c-earth-net', name: 'Réseau Terrestre', type: 'Communication', bodyId: 'earth', satellitesCount: 0, totalBonus: 0, color: '#3b82f6' },
      { id: 'c-earth-gps', name: 'GPS Terre', type: 'Navigation', bodyId: 'earth', satellitesCount: 0, totalBonus: 0, color: '#10b981' },
    ] as Constellation[],
    isSystemOffline: false,
    offlineDaysRemaining: 0,
  }),

  getters: {
    availableComponents: (state) => {
      const researchStore = useResearchStore()
      return state.components.filter((c) => {
        if (!c.unlockResearchId) return true
        return researchStore.completedResearchIds.includes(c.unlockResearchId)
      })
    },
    totalIncome: (state) => {
      if (state.isSystemOffline) return 0
      return state.activeSatellites
        .filter((s) => s.status === 'En Orbite')
        .reduce((sum, sat) => {
          const design = state.designs.find((d) => d.id === sat.designId)
          if (!design) return sum
          const income = design.instrumentIds.reduce((instSum, instId) => {
            const component = state.components.find((c) => c.id === instId)
            return instSum + (component?.bonusType === 'Communication' ? component.bonusValue || 0 : 0)
          }, 0)
          return sum + income * (sat.health / 100)
        }, 0)
    },
    totalScience: (state) => {
      if (state.isSystemOffline) return 0
      return state.activeSatellites
        .filter((s) => s.status === 'En Orbite')
        .reduce((sum, sat) => {
          const design = state.designs.find((d) => d.id === sat.designId)
          if (!design) return sum
          const science = design.instrumentIds.reduce((instSum, instId) => {
            const component = state.components.find((c) => c.id === instId)
            return instSum + (component?.bonusType === 'Science' ? component.bonusValue || 0 : 0)
          }, 0)
          return sum + science * (sat.health / 100)
        }, 0)
    },
    navigationBonus: (state) => (bodyId: string) => {
      const total = state.activeSatellites
        .filter((s) => s.status === 'En Orbite' && s.bodyId === bodyId)
        .reduce((sum, sat) => {
          const design = state.designs.find((d) => d.id === sat.designId)
          if (!design) return sum
          const bonus = design.instrumentIds.reduce((instSum, instId) => {
            const component = state.components.find((c) => c.id === instId)
            return instSum + (component?.bonusType === 'Navigation' ? component.bonusValue || 0 : 0)
          }, 0)
          return sum + bonus
        }, 0)
      return Math.min(15, total) // Cap à 15% de bonus par planète
    },
  },

  actions: {
    saveDesign(design: Omit<SatelliteDesign, 'id'>) {
      const newDesign: SatelliteDesign = {
        ...design,
        id: `design-${Math.random().toString(36).substr(2, 5)}`,
      }
      this.designs.push(newDesign)
      return newDesign
    },

    createConstellation(name: string, type: SatelliteType, bodyId: string) {
      const colors = {
        'Communication': '#3b82f6',
        'Navigation': '#10b981',
        'Science': '#8b5cf6',
        'Observation': '#f59e0b'
      }
      const newC: Constellation = {
        id: `const-${Math.random().toString(36).substr(2, 5)}`,
        name,
        type,
        bodyId,
        satellitesCount: 0,
        totalBonus: 0,
        color: colors[type] || '#ffffff'
      }
      this.constellations.push(newC)
      return newC
    },

    buildSatellite(designId: string) {
      const design = this.designs.find((d) => d.id === designId)
      if (!design) return

      const resourceStore = useResourceStore()
      if (resourceStore.argent < design.totalCost) return

      resourceStore.addArgent(-design.totalCost)

      const newSat: ActiveSatellite = {
        id: `sat-${Math.random().toString(36).substr(2, 9)}`,
        designId: design.id,
        name: `${design.name} #${this.activeSatellites.length + 1}`,
        status: 'Prêt',
        orbit: 'LEO',
        bodyId: 'earth',
        health: 100,
        deployedDate: useGameStore().elapsedDays,
      }

      this.activeSatellites.push(newSat)
    },

    deployToOrbit(satelliteId: string, orbit: OrbitType, bodyId: string, constellationId?: string) {
      const sat = this.activeSatellites.find((s) => s.id === satelliteId)
      if (sat) {
        sat.status = 'En Orbite'
        sat.orbit = orbit
        sat.bodyId = bodyId
        sat.constellationId = constellationId
        this.updateConstellations()
      }
    },

    updateConstellations() {
      this.constellations.forEach((c) => {
        const sats = this.activeSatellites.filter((s) => s.constellationId === c.id && s.status === 'En Orbite' && s.bodyId === c.bodyId)
        c.satellitesCount = sats.length
        
        const baseBonus = sats.reduce((sum, sat) => {
            const design = this.designs.find(d => d.id === sat.designId)
            if (!design) return sum
            return sum + design.instrumentIds.reduce((instSum, instId) => {
                const component = this.components.find(comp => comp.id === instId)
                return instSum + (component?.bonusType === c.type ? component.bonusValue || 0 : 0)
            }, 0)
        }, 0)
        
        c.totalBonus = baseBonus * (1 + (sats.length > 1 ? (sats.length - 1) * 0.1 : 0))
      })
    },

    tick(deltaTime: number) {
        const daysPassed = deltaTime / 500
        
        if (this.isSystemOffline) {
          this.offlineDaysRemaining -= daysPassed
          if (this.offlineDaysRemaining <= 0) {
            this.isSystemOffline = false
            this.offlineDaysRemaining = 0
          }
        }

        this.activeSatellites.forEach(sat => {
            if (sat.status === 'En Orbite') {
                sat.health = Math.max(0, sat.health - 0.05 * daysPassed)
                if (sat.health <= 0) sat.status = 'Désactivé'
            }
        })
        
        const resourceStore = useResourceStore()
        resourceStore.addArgent(this.totalIncome * daysPassed)
        resourceStore.addScience((this.totalScience / 1000) * daysPassed)
    },

    setOffline(days: number) {
      this.isSystemOffline = true
      this.offlineDaysRemaining = days
    }
  },
  persist: true,
})
