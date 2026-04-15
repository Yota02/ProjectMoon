import { defineStore } from 'pinia'
import { useResourceStore } from './useResourceStore'
import { useResearchStore } from './useResearchStore'

export type FleetItemStatus = 'Prêt' | 'En maintenance' | 'En construction'

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
        constructionTime: 30, // 30 jours
        baseReliability: 85,
        researchId: 'l-micro',
        type: 'launcher'
      },
      {
        id: 'd-medium',
        name: 'Lanceur Moyen',
        description: 'Capacité d\'emport équilibrée.',
        cost: 150000000,
        constructionTime: 60, // 60 jours
        baseReliability: 92,
        researchId: 'l-medium',
        type: 'launcher'
      },
      {
        id: 'd-heavy',
        name: 'Lanceur Lourd',
        description: 'Pour les charges massives et lointaines.',
        cost: 450000000,
        constructionTime: 120, // 120 jours
        baseReliability: 95,
        researchId: 'l-heavy',
        type: 'launcher'
      },
      {
        id: 'd-super-heavy',
        name: 'Lanceur Super-Lourd',
        description: 'Indispensable pour la colonisation.',
        cost: 1200000000,
        constructionTime: 240, // 240 jours
        baseReliability: 96,
        researchId: 'l-super-heavy',
        type: 'launcher'
      },
      {
        id: 'd-starship',
        name: 'Vaisseau Interplanétaire',
        description: 'Le futur de l\'exploration spatiale.',
        cost: 2500000000,
        constructionTime: 480, // 480 jours
        baseReliability: 98,
        researchId: 'l-starship',
        type: 'ship'
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
      
      // Bonus basés sur les recherches (exemple: Moteur Chimique réduit le temps, Guidage augmente la fiabilité)
      const reliabilityBonus = researchStore.completedResearchIds.includes('i-guidage') ? 5 : 0
      const speedBonus = researchStore.completedResearchIds.includes('m-chimique') ? 0.9 : 1

      const newDesign: FleetDesign = {
        id: `custom-${Math.random().toString(36).substr(2, 5)}`,
        name: name || `Nouveau ${baseDesign.name}`,
        description: `Design personnalisé basé sur le ${baseDesign.name}.`,
        cost: Math.round(baseDesign.cost * 1.1), // Un design perso coûte 10% de plus à produire
        constructionTime: Math.round(baseDesign.constructionTime * speedBonus),
        baseReliability: Math.min(99, baseDesign.baseReliability + reliabilityBonus),
        researchId: baseDesign.researchId,
        type: type
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
      
      this.items.forEach(item => {
        if (item.status === 'En construction') {
          item.constructionProgress += (daysPassed / item.constructionTime) * 100
          if (item.constructionProgress >= 100) {
            item.constructionProgress = 100
            item.status = 'Prêt'
          }
        }
      })
    }
  }
})
