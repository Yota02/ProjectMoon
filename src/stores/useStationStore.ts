import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useResourceStore } from './useResourceStore'
import { useGameStore } from './useGameStore'
import { useResearchStore } from './useResearchStore'

export type StationModuleType = 'housing' | 'science' | 'production' | 'storage' | 'command'

export interface StationModule {
  id: string
  name: string
  description: string
  type: StationModuleType
  cost: { argent: number; science: number }
  researchId?: string
  bonuses: {
    argentPerDay?: number
    sciencePerDay?: number
    carburantPerDay?: number
    personnelCapacity?: number
  }
}

export interface Station {
  id: string
  name: string
  orbitBodyId: string
  moduleIds: string[]
  astronautIds: number[]
  level: number
  constructionFinishedDay: number
}

export const STATION_MODULES: StationModule[] = [
  {
    id: 'habitat_basic',
    name: 'Module Habitation Alpha',
    description: "Permet d'accueillir 2 astronautes.",
    type: 'housing',
    cost: { argent: 500, science: 50 },
    researchId: 'c-station-habitat',
    bonuses: { personnelCapacity: 2 },
  },
  {
    id: 'lab_basic',
    name: 'Laboratoire de Microgravité',
    description: 'Produit de la science chaque jour.',
    type: 'science',
    cost: { argent: 800, science: 100 },
    researchId: 'c-station-lab',
    bonuses: { sciencePerDay: 5 },
  },
  {
    id: 'solar_panel_basic',
    name: 'Panneaux Solaires',
    description: "Génère un petit revenu par la vente d'énergie.",
    type: 'production',
    cost: { argent: 300, science: 30 },
    researchId: 'c-station-power',
    bonuses: { argentPerDay: 10 },
  },
  {
    id: 'fuel_depot_basic',
    name: 'Dépôt de Carburant Orbital',
    description: 'Produit du carburant.',
    type: 'production',
    cost: { argent: 600, science: 80 },
    researchId: 'c-station-base',
    bonuses: { carburantPerDay: 2 },
  },
  {
    id: 'command_center_basic',
    name: 'Centre de Commandement',
    description: 'Indispensable pour coordonner la station.',
    type: 'command',
    cost: { argent: 1000, science: 200 },
    researchId: 'c-station-base',
    bonuses: { sciencePerDay: 2, argentPerDay: 5 },
  },
]

export const useStationStore = defineStore('station', () => {
  const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'test'

  const stations = ref<Station[]>(
    isDebugMode
      ? [
          {
            id: 'iss-debug',
            name: 'ISS Debug',
            orbitBodyId: 'earth',
            moduleIds: STATION_MODULES.map((m) => m.id),
            astronautIds: [999, 1000],
            level: 1,
            constructionFinishedDay: 0,
          },
          {
            id: 'lunar-station-debug',
            name: 'Station Lunaire Alpha',
            orbitBodyId: 'moon',
            moduleIds: ['habitat_basic', 'lab_basic', 'command_center_basic'],
            astronautIds: [],
            level: 1,
            constructionFinishedDay: 0,
          },
        ]
      : [],
  )
  const gameStore = useGameStore()
  const resourceStore = useResourceStore()
  const researchStore = useResearchStore()

  const availableModules = ref<StationModule[]>(STATION_MODULES)

  const isModuleUnlocked = (moduleId: string) => {
    const module = STATION_MODULES.find((m) => m.id === moduleId)
    if (!module || !module.researchId) return true
    return researchStore.completedResearchIds.includes(module.researchId)
  }

  const isStationConstructionUnlocked = computed(() => {
    return researchStore.completedResearchIds.includes('c-station-base')
  })

  const unlockedModules = computed(() => {
    return STATION_MODULES.filter((m) => isModuleUnlocked(m.id))
  })

  const totalPersonnelCapacity = computed(() => {
    return stations.value.reduce((total, station) => {
      return (
        total +
        station.moduleIds.reduce((subTotal, moduleId) => {
          const module = STATION_MODULES.find((m) => m.id === moduleId)
          return subTotal + (module?.bonuses.personnelCapacity || 0)
        }, 0)
      )
    }, 0)
  })

  const stationBonuses = computed(() => {
    let argentPerDay = 0
    let sciencePerDay = 0
    let carburantPerDay = 0

    stations.value.forEach((station) => {
      if (gameStore.elapsedDays >= station.constructionFinishedDay) {
        station.moduleIds.forEach((moduleId) => {
          const module = STATION_MODULES.find((m) => m.id === moduleId)
          if (module) {
            argentPerDay += module.bonuses.argentPerDay || 0
            sciencePerDay += module.bonuses.sciencePerDay || 0
            carburantPerDay += module.bonuses.carburantPerDay || 0
          }
        })
      }
    })

    return { argentPerDay, sciencePerDay, carburantPerDay }
  })

  const stationConsumption = computed(() => {
    let nourriture = 0
    let eau = 0
    let o2 = 0
    let piecesDetachees = 0

    stations.value.forEach((station) => {
      if (gameStore.elapsedDays >= station.constructionFinishedDay) {
        // Consumption per astronaut
        nourriture += station.astronautIds.length * 1
        eau += station.astronautIds.length * 1
        o2 += station.astronautIds.length * 1

        // Fixed maintenance consumption per station
        piecesDetachees += 0.5
      }
    })

    return { nourriture, eau, o2, piecesDetachees }
  })

  const createStation = (name: string, orbitBodyId: string) => {
    if (!isStationConstructionUnlocked.value) {
      return { success: false, message: 'Recherche "Infrastructure Station Orbitale" requise' }
    }

    const cost = { argent: 2000, science: 500 }

    if (resourceStore.argent < cost.argent || resourceStore.science < cost.science) {
      return { success: false, message: 'Ressources insuffisantes' }
    }

    resourceStore.addArgent(-cost.argent)
    resourceStore.addScience(-cost.science)

    const newStation: Station = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      orbitBodyId,
      moduleIds: ['command_center_basic'], // Starter module
      astronautIds: [],
      level: 1,
      constructionFinishedDay: gameStore.elapsedDays + 10, // Takes 10 days to build
    }

    stations.value.push(newStation)
    return { success: true, station: newStation }
  }

  const addModuleToStation = (stationId: string, moduleId: string) => {
    const station = stations.value.find((s) => s.id === stationId)
    const module = STATION_MODULES.find((m) => m.id === moduleId)

    if (!station || !module) return { success: false, message: 'Station ou module introuvable' }

    if (!isModuleUnlocked(moduleId)) {
      return { success: false, message: 'Module non débloqué par la recherche' }
    }

    if (resourceStore.argent < module.cost.argent || resourceStore.science < module.cost.science) {
      return { success: false, message: 'Ressources insuffisantes' }
    }

    resourceStore.addArgent(-module.cost.argent)
    resourceStore.addScience(-module.cost.science)

    station.moduleIds.push(moduleId)
    return { success: true }
  }

  const assignAstronautToStation = (stationId: string, astronautId: number) => {
    const station = stations.value.find((s) => s.id === stationId)
    if (!station) return { success: false, message: 'Station introuvable' }

    // Check capacity
    const capacity = station.moduleIds.reduce((total, moduleId) => {
      const module = STATION_MODULES.find((m) => m.id === moduleId)
      return total + (module?.bonuses.personnelCapacity || 0)
    }, 0)

    if (station.astronautIds.length >= capacity) {
      return { success: false, message: 'Capacité maximale atteinte' }
    }

    if (station.astronautIds.includes(astronautId)) {
      return { success: false, message: "L'astronaute est déjà assigné" }
    }

    station.astronautIds.push(astronautId)
    return { success: true }
  }

  const removeAstronautFromStation = (stationId: string, astronautId: number) => {
    const station = stations.value.find((s) => s.id === stationId)
    if (!station) return { success: false, message: 'Station introuvable' }

    station.astronautIds = station.astronautIds.filter((id) => id !== astronautId)
    return { success: true }
  }

  return {
    stations,
    availableModules,
    unlockedModules,
    isModuleUnlocked,
    isStationConstructionUnlocked,
    totalPersonnelCapacity,
    stationBonuses,
    stationConsumption,
    createStation,
    addModuleToStation,
    assignAstronautToStation,
    removeAstronautFromStation,
  }
})
