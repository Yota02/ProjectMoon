import { defineStore } from 'pinia'
import { useResourceStore } from './useResourceStore'
import { useResearchStore } from './useResearchStore'
import { useBaseStore } from './useBaseStore'

export type FleetItemStatus = 'Prêt' | 'En maintenance' | 'En construction'
export type OrbitType = 'LEO' | 'MEO' | 'GEO' | 'HEO' | 'LUNAR' | 'MARTIAN'

export interface FleetItem {
  id: string
  designId: string
  name: string
  status: FleetItemStatus
  reliability: number
  constructionProgress: number
  constructionTime: number // en jours
}

export interface FleetDesign {
  id: string
  name: string
  description: string
  cost: number
  constructionTime: number // en jours
  baseReliability: number
  researchId: string
  type: 'launcher' | 'ship'
  // Nouvelles stats
  isReusable: boolean
  maxSpeed: number // en km/s
  supportedOrbits: OrbitType[]
  canReachMoon: boolean
  isRefuelable: boolean
}

export const useFleetStore = defineStore('fleet', {
  state: () => ({
    items: [] as FleetItem[],
    designs: [
      {
        id: 'd-micro',
        name: 'Micro-Lanceur',
        description: 'Petit lanceur pour satellites légers.',
        cost: 50000000,
        constructionTime: 30,
        baseReliability: 85,
        researchId: 'l-micro',
        type: 'launcher',
        isReusable: false,
        maxSpeed: 7.8,
        supportedOrbits: ['LEO'],
        canReachMoon: false,
        isRefuelable: false
      },
      {
        id: 'd-medium',
        name: 'Lanceur Moyen',
        description: 'Capacité d\'emport équilibrée.',
        cost: 150000000,
        constructionTime: 60,
        baseReliability: 92,
        researchId: 'l-medium',
        type: 'launcher',
        isReusable: false,
        maxSpeed: 9.5,
        supportedOrbits: ['LEO', 'MEO'],
        canReachMoon: false,
        isRefuelable: false
      },
      {
        id: 'd-heavy',
        name: 'Lanceur Lourd',
        description: 'Pour les charges massives et lointaines.',
        cost: 450000000,
        constructionTime: 120,
        baseReliability: 95,
        researchId: 'l-heavy',
        type: 'launcher',
        isReusable: false,
        maxSpeed: 11.2,
        supportedOrbits: ['LEO', 'MEO', 'GEO'],
        canReachMoon: true,
        isRefuelable: false
      },
      {
        id: 'd-super-heavy',
        name: 'Lanceur Super-Lourd',
        description: 'Indispensable pour la colonisation.',
        cost: 1200000000,
        constructionTime: 240,
        baseReliability: 96,
        researchId: 'l-super-heavy',
        type: 'launcher',
        isReusable: true,
        maxSpeed: 12.5,
        supportedOrbits: ['LEO', 'MEO', 'GEO', 'HEO', 'LUNAR'],
        canReachMoon: true,
        isRefuelable: true
      },
      {
        id: 'd-starship',
        name: 'Vaisseau Interplanétaire',
        description: 'Le futur de l\'exploration spatiale.',
        cost: 2500000000,
        constructionTime: 480,
        baseReliability: 98,
        researchId: 'l-starship',
        type: 'ship',
        isReusable: true,
        maxSpeed: 17.5,
        supportedOrbits: ['LEO', 'MEO', 'GEO', 'HEO', 'LUNAR', 'MARTIAN'],
        canReachMoon: true,
        isRefuelable: true
      }
    ] as FleetDesign[]
  }),
  getters: {
    availableDesigns: (state) => {
      const researchStore = useResearchStore()
      return state.designs.filter(d => 
        researchStore.completedResearchIds.includes(d.researchId)
      )
    },
    readyLaunchers: (state) => {
      return state.items.filter(i => i.status === 'Prêt' && state.designs.find(d => d.id === i.designId)?.type === 'launcher')
    },
    readyShips: (state) => {
      return state.items.filter(i => i.status === 'Prêt' && state.designs.find(d => d.id === i.designId)?.type === 'ship')
    }
  },
  actions: {
    createDesign(name: string, type: 'launcher' | 'ship', baseDesignId: string) {
      const baseDesign = this.designs.find(d => d.id === baseDesignId)
      if (!baseDesign) return

      const researchStore = useResearchStore()
      
      // Bonus basés sur les recherches
      const reliabilityBonus = researchStore.completedResearchIds.includes('i-guidage') ? 5 : 0
      const speedBonus = researchStore.completedResearchIds.includes('m-chimique') ? 1.1 : 1
      const isReusable = researchStore.completedResearchIds.includes('l-reusable') || baseDesign.isReusable

      const newDesign: FleetDesign = {
        id: `custom-${Math.random().toString(36).substr(2, 5)}`,
        name: name || `Nouveau ${baseDesign.name}`,
        description: `Design personnalisé basé sur le ${baseDesign.name}.`,
        cost: Math.round(baseDesign.cost * 1.1),
        constructionTime: baseDesign.constructionTime,
        baseReliability: Math.min(99, baseDesign.baseReliability + reliabilityBonus),
        researchId: baseDesign.researchId,
        type: type,
        isReusable: isReusable,
        maxSpeed: baseDesign.maxSpeed * speedBonus,
        supportedOrbits: [...baseDesign.supportedOrbits],
        canReachMoon: baseDesign.canReachMoon,
        isRefuelable: baseDesign.isRefuelable
      }

      this.designs.push(newDesign)
    },
    build(designId: string) {
      const resourceStore = useResourceStore()
      const design = this.designs.find(d => d.id === designId)
      
      if (!design) return
      if (resourceStore.argent < design.cost) return

      resourceStore.addArgent(-design.cost)
      
      const newItem: FleetItem = {
        id: Math.random().toString(36).substr(2, 9),
        designId: design.id,
        name: `${design.name} #${this.items.filter(i => i.designId === design.id).length + 1}`,
        status: 'En construction',
        reliability: design.baseReliability,
        constructionProgress: 0,
        constructionTime: design.constructionTime
      }
      
      this.items.push(newItem)
    },
    tick(deltaTime: number) {
      // 500ms = 1 jour
      const daysPassed = deltaTime / 500

      const baseStore = useBaseStore()
      const hasConnectedPad = baseStore.placedBuildings.some(
        (b) => b.buildingId === 'launch_pad' && baseStore.isBuildingConnected(b),
      )

      if (!hasConnectedPad) return

      this.items.forEach((item) => {
        const design = this.designs.find(d => d.id === item.designId)
        if (!design) return

        if (item.status === 'En construction') {
          item.constructionProgress += (daysPassed / item.constructionTime) * 100
          if (item.constructionProgress >= 100) {
            item.constructionProgress = 100
            item.status = 'Prêt'
          }
        } else if (item.status === 'En maintenance') {
          // La maintenance prend 50% du temps de construction
          const maintenanceTime = item.constructionTime * 0.5
          item.constructionProgress -= (daysPassed / maintenanceTime) * 100
          if (item.constructionProgress <= 0) {
            item.constructionProgress = 100
            item.status = 'Prêt'
          }
        }
      })
    }
  }
})
