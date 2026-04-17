import { defineStore } from 'pinia'
import { useResourceStore } from './useResourceStore'
import { useResearchStore } from './useResearchStore'
import { useBaseStore } from './useBaseStore'
import { useStationStore } from './useStationStore'

export type FleetItemStatus = 'Prêt' | 'En maintenance' | 'En construction'
export type OrbitType = 'LEO' | 'MEO' | 'GEO' | 'HEO' | 'LUNAR' | 'MARTIAN'
export type FleetItemLocation = 'Earth' | 'Orbit'

export interface FleetItem {
  id: string
  designId: string
  name: string
  status: FleetItemStatus
  reliability: number
  constructionProgress: number
  constructionTime: number // en jours
  location: FleetItemLocation // Nouveau
}

export interface FleetDesign {
  id: string
  name: string
  description: string
  cost: number
  materiauxRaresCost?: number // Nouveau
  constructionTime: number // en jours
  baseReliability: number
  researchId: string
  type: 'launcher' | 'ship'
  // Nouvelles stats
  isReusable: boolean
  maxSpeed: number // en km/s
  cargoCapacity: number // charge utile max pour ravitaillement
  supportedOrbits: OrbitType[]
  canReachMoon: boolean
  isRefuelable: boolean
  // Propriétés pour la consommation de carburant
  power: number // Puissance du moteur (en unités arbitraires)
  weight: number // Poids à vide (en tonnes)
  requiresShipyard?: boolean // Nouveau
}

const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'test'

export const useFleetStore = defineStore('fleet', {
  state: () => ({
    items: isDebugMode
      ? [
          {
            id: 'debug-launcher-1',
            designId: 'd-micro',
            name: 'Micro-Lanceur #1',
            status: 'Prêt',
            reliability: 95,
            constructionProgress: 100,
            constructionTime: 30,
            location: 'Earth',
          },
          {
            id: 'debug-launcher-2',
            designId: 'd-heavy',
            name: 'Lanceur Lourd #1',
            status: 'Prêt',
            reliability: 98,
            constructionProgress: 100,
            constructionTime: 120,
            location: 'Earth',
          },
        ]
      : ([] as FleetItem[]),
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
        cargoCapacity: 500,
        supportedOrbits: ['LEO'],
        canReachMoon: false,
        isRefuelable: false,
        power: 50,
        weight: 10,
      },
      {
        id: 'd-medium',
        name: 'Lanceur Moyen',
        description: "Capacité d'emport équilibrée.",
        cost: 150000000,
        constructionTime: 60,
        baseReliability: 92,
        researchId: 'l-medium',
        type: 'launcher',
        isReusable: false,
        maxSpeed: 9.5,
        cargoCapacity: 1100,
        supportedOrbits: ['LEO', 'MEO'],
        canReachMoon: false,
        isRefuelable: false,
        power: 100,
        weight: 25,
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
        cargoCapacity: 2200,
        supportedOrbits: ['LEO', 'MEO', 'GEO'],
        canReachMoon: true,
        isRefuelable: false,
        power: 200,
        weight: 50,
      },
      {
        id: 'd-super-heavy',
        name: 'Lanceur Super-Lourd',
        description: 'Indispensable pour la colonisation.',
        cost: 1200000000,
        materiauxRaresCost: 50,
        constructionTime: 240,
        baseReliability: 96,
        researchId: 'l-super-heavy',
        type: 'launcher',
        isReusable: true,
        maxSpeed: 12.5,
        cargoCapacity: 3800,
        supportedOrbits: ['LEO', 'MEO', 'GEO', 'HEO', 'LUNAR'],
        canReachMoon: true,
        isRefuelable: true,
        power: 400,
        weight: 100,
      },
      {
        id: 'd-starship',
        name: 'Vaisseau Interplanétaire',
        description: "Le futur de l'exploration spatiale. Construction orbitale privilégiée.",
        cost: 2500000000,
        materiauxRaresCost: 200,
        constructionTime: 480,
        baseReliability: 98,
        researchId: 'l-starship',
        type: 'ship',
        isReusable: true,
        maxSpeed: 17.5,
        cargoCapacity: 6500,
        supportedOrbits: ['LEO', 'MEO', 'GEO', 'HEO', 'LUNAR', 'MARTIAN'],
        canReachMoon: true,
        isRefuelable: true,
        power: 600,
        weight: 120,
        requiresShipyard: true,
      },
    ] as FleetDesign[],
  }),
  getters: {
    availableDesigns: (state) => {
      const researchStore = useResearchStore()
      return state.designs.filter((d) => researchStore.completedResearchIds.includes(d.researchId))
    },
    readyLaunchers: (state) => {
      return state.items.filter(
        (i) =>
          i.status === 'Prêt' &&
          state.designs.find((d) => d.id === i.designId)?.type === 'launcher',
      )
    },
    readyShips: (state) => {
      return state.items.filter(
        (i) =>
          i.status === 'Prêt' && state.designs.find((d) => d.id === i.designId)?.type === 'ship',
      )
    },
    launcherCargoCapacity: (state) => {
      return (launcherId?: string) => {
        if (!launcherId) return 0
        const launcher = state.items.find((item) => item.id === launcherId)
        if (!launcher) return 0
        return state.designs.find((design) => design.id === launcher.designId)?.cargoCapacity ?? 0
      }
    },
    isItemStalled: (state) => {
      return (itemId: string) => {
        const item = state.items.find((i) => i.id === itemId)
        if (!item || item.status === 'Prêt') return false

        const baseStore = useBaseStore()
        const stationStore = useStationStore()

        if (item.location === 'Earth') {
          return !baseStore.isAnyBuildingConnected('launch_pad')
        } else if (item.location === 'Orbit') {
          return !stationStore.stations.some((s) =>
            s.placedModules.some((m) => m.moduleId === 'drydock_orbital'),
          )
        }
        return false
      }
    },
    // Calcule la consommation de carburant pour un lancement
    calculateFuelConsumption: (state) => {
      return (launcherId: string, payloadWeight: number = 0) => {
        const launcher = state.items.find((item) => item.id === launcherId)
        if (!launcher) return 0
        const design = state.designs.find((d) => d.id === launcher.designId)
        if (!design) return 0

        // Si le vaisseau est déjà en orbite (Chantier Naval), la consommation de décollage (gravité) est nulle.
        // On ne paye que pour la navigation orbitale (très réduite).
        const gravityFactor = launcher.location === 'Orbit' ? 0.1 : 1

        // Formule: carburant nécessaire = (poids total / puissance) * facteur
        const totalWeight = design.weight + payloadWeight
        let consumption = Math.ceil((totalWeight / design.power) * 10 * gravityFactor)

        // Breakthrough: Propulsion Nucléaire Thermique
        const researchStore = useResearchStore()
        if (researchStore.completedResearchIds.includes('m-nucleaire')) {
          consumption = Math.ceil(consumption / 2)
        }

        return consumption
      }
    },
  },
  actions: {
    createDesign(name: string, type: 'launcher' | 'ship', baseDesignId: string) {
      const baseDesign = this.designs.find((d) => d.id === baseDesignId)
      if (!baseDesign) return

      const researchStore = useResearchStore()

      // Bonus basés sur les recherches
      const reliabilityBonus = researchStore.completedResearchIds.includes('i-guidage') ? 5 : 0
      const speedBonus = researchStore.completedResearchIds.includes('m-chimique') ? 1.1 : 1
      const isReusable =
        researchStore.completedResearchIds.includes('l-reusable') || baseDesign.isReusable

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
        cargoCapacity: baseDesign.cargoCapacity,
        supportedOrbits: [...baseDesign.supportedOrbits],
        canReachMoon: baseDesign.canReachMoon,
        isRefuelable: baseDesign.isRefuelable,
        power: baseDesign.power,
        weight: baseDesign.weight,
      }

      this.designs.push(newDesign)
    },
    async build(designId: string, buildLocation: FleetItemLocation = 'Earth') {
      const resourceStore = useResourceStore()
      const design = this.designs.find((d) => d.id === designId)

      if (!design) return
      
      const materiauxCost = design.materiauxRaresCost || 0
      if (resourceStore.argent < design.cost || resourceStore.materiauxRares < materiauxCost) return

      if (buildLocation === 'Orbit') {
        const stationStore = (await import('./useStationStore')).useStationStore()
        const hasShipyard = stationStore.stations.some(s => 
          s.placedModules.some(m => m.moduleId === 'drydock_orbital')
        )
        if (!hasShipyard) return
      } else if (design.requiresShipyard) {
        // Enforce orbital construction for designs that require it
        return 
      }

      resourceStore.addArgent(-design.cost)
      resourceStore.addMateriauxRares(-materiauxCost)

      const newItem: FleetItem = {
        id: Math.random().toString(36).substr(2, 9),
        designId: design.id,
        name: `${design.name} #${this.items.filter((i) => i.designId === design.id).length + 1}`,
        status: 'En construction',
        reliability: design.baseReliability,
        constructionProgress: 0,
        constructionTime: design.constructionTime,
        location: buildLocation,
      }

      this.items.push(newItem)
    },
    tick(deltaTime: number) {
      // 500ms = 1 jour
      const daysPassed = deltaTime / 500
      const baseStore = useBaseStore()
      const stationStore = useStationStore()

      // On vérifie le statut global des installations pour optimiser les performances
      const hasAnyConnectedPad = baseStore.isAnyBuildingConnected('launch_pad')
      const hasAnyShipyard = stationStore.stations.some((s) =>
        s.placedModules.some((m) => m.moduleId === 'drydock_orbital'),
      )

      this.items.forEach((item) => {
        const design = this.designs.find((d) => d.id === item.designId)
        if (!design) return

        // Vérification de l'éligibilité à la progression
        let canProgress = false
        if (item.location === 'Earth') {
          // Sur Terre, on a besoin d'un pas de tir connecté (sur n'importe quelle base terrestre)
          canProgress = hasAnyConnectedPad
        } else if (item.location === 'Orbit') {
          // En orbite, on a besoin d'un chantier naval (drydock)
          canProgress = hasAnyShipyard
        }

        if (!canProgress) return

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
    },
  },

})
