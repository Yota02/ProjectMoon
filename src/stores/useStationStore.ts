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
  width: number
  height: number
  symbol: string
  colorClass: string
}

export interface StationResources {
  nourriture: number
  eau: number
  o2: number
  piecesDetachees: number
}

export interface PlacedModule {
  x: number
  y: number
  moduleId: string
  rotation: 'horizontal' | 'vertical'
}

export interface Station {
  id: string
  name: string
  orbitBodyId: string
  moduleIds: string[] // Deprecated, keep for legacy
  placedModules: PlacedModule[]
  astronautIds: number[]
  level: number
  constructionFinishedDay: number
  resources?: StationResources
  mapWidth: number
  mapHeight: number
  mapOffsetX: number
  mapOffsetY: number
  civilianPopulation: number
  owner?: 'player' | 'external'
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
    width: 2,
    height: 1,
    symbol: 'HB',
    colorClass: 'bg-blue-500/80 border-blue-300/80',
  },
  {
    id: 'lab_basic',
    name: 'Laboratoire de Microgravité',
    description: 'Produit de la science chaque jour.',
    type: 'science',
    cost: { argent: 800, science: 100 },
    researchId: 'c-station-lab',
    bonuses: { sciencePerDay: 5 },
    width: 2,
    height: 1,
    symbol: 'LB',
    colorClass: 'bg-violet-500/80 border-violet-300/80',
  },
  {
    id: 'solar_panel_basic',
    name: 'Panneaux Solaires',
    description: "Génère un petit revenu par la vente d'énergie.",
    type: 'production',
    cost: { argent: 300, science: 30 },
    researchId: 'c-station-power',
    bonuses: { argentPerDay: 10 },
    width: 1,
    height: 2,
    symbol: 'SN',
    colorClass: 'bg-amber-500/80 border-amber-300/80',
  },
  {
    id: 'fuel_depot_basic',
    name: 'Dépôt de Carburant Orbital',
    description: 'Produit du carburant.',
    type: 'production',
    cost: { argent: 600, science: 80 },
    researchId: 'c-station-base',
    bonuses: { carburantPerDay: 2 },
    width: 2,
    height: 2,
    symbol: 'FD',
    colorClass: 'bg-rose-500/80 border-rose-300/80',
  },
  {
    id: 'command_center_basic',
    name: 'Centre de Commandement',
    description: 'Indispensable pour coordonner la station.',
    type: 'command',
    cost: { argent: 1000, science: 200 },
    researchId: 'c-station-base',
    bonuses: { sciencePerDay: 2, argentPerDay: 5 },
    width: 2,
    height: 2,
    symbol: 'HQ',
    colorClass: 'bg-indigo-500/80 border-indigo-300/80',
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
            placedModules: STATION_MODULES.map((m, i) => ({
              x: i * 2,
              y: 0,
              moduleId: m.id,
              rotation: 'horizontal',
            })),
            astronautIds: [999, 1000],
            level: 1,
            constructionFinishedDay: 0,
            resources: { nourriture: 100, eau: 100, o2: 100, piecesDetachees: 50 },
            mapWidth: 12,
            mapHeight: 12,
            mapOffsetX: 0,
            mapOffsetY: 0,
            civilianPopulation: 0,
            owner: 'external',
          },
          {
            id: 'lunar-station-debug',
            name: 'Station Lunaire Alpha',
            orbitBodyId: 'moon',
            moduleIds: ['habitat_basic', 'lab_basic', 'command_center_basic'],
            placedModules: [
              { x: 4, y: 5, moduleId: 'command_center_basic', rotation: 'horizontal' },
              { x: 6, y: 5, moduleId: 'habitat_basic', rotation: 'horizontal' },
              { x: 4, y: 7, moduleId: 'lab_basic', rotation: 'horizontal' },
            ],
            astronautIds: [],
            level: 1,
            constructionFinishedDay: 0,
            resources: { nourriture: 50, eau: 50, o2: 50, piecesDetachees: 25 },
            mapWidth: 12,
            mapHeight: 12,
            mapOffsetX: 0,
            mapOffsetY: 0,
            civilianPopulation: 0,
            owner: 'external',
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
        station.placedModules.reduce((subTotal, placed) => {
          const module = STATION_MODULES.find((m) => m.id === placed.moduleId)
          return subTotal + (module?.bonuses.personnelCapacity || 0)
        }, 0)
      )
    }, 0)
  })

  const marsCivilianPopulation = computed(() => {
    return stations.value
      .filter((s) => s.orbitBodyId === 'mars' && s.constructionFinishedDay <= gameStore.elapsedDays)
      .reduce((total, s) => total + s.civilianPopulation, 0)
  })

  const stationBonuses = computed(() => {
    let argentPerDay = 0
    let sciencePerDay = 0
    let carburantPerDay = 0

    stations.value.forEach((station) => {
      if (gameStore.elapsedDays >= station.constructionFinishedDay) {
        station.placedModules.forEach((placed) => {
          const module = STATION_MODULES.find((m) => m.id === placed.moduleId)
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
      moduleIds: ['command_center_basic'],
      placedModules: [{ x: 5, y: 5, moduleId: 'command_center_basic', rotation: 'horizontal' }],
      astronautIds: [],
      level: 1,
      constructionFinishedDay: gameStore.elapsedDays + 10,
      resources: {
        nourriture: 50,
        eau: 50,
        o2: 50,
        piecesDetachees: 25,
      },
      mapWidth: 12,
      mapHeight: 12,
      mapOffsetX: 0,
      mapOffsetY: 0,
      civilianPopulation: 0,
      owner: 'player',
    }

    stations.value.push(newStation)
    return { success: true, station: newStation }
  }

  const isModulePlacementPossible = (
    stationId: string,
    moduleId: string,
    x: number,
    y: number,
    rotation: 'horizontal' | 'vertical',
  ) => {
    const station = stations.value.find((s) => s.id === stationId)
    const module = STATION_MODULES.find((m) => m.id === moduleId)
    if (!station || !module) return false

    const w = rotation === 'horizontal' ? module.width : module.height
    const h = rotation === 'horizontal' ? module.height : module.width

    // Map bounds
    if (x < 0 || y < 0 || x + w > station.mapWidth || y + h > station.mapHeight) return false

    // Overlap
    return !station.placedModules.some((placed) => {
      const pm = STATION_MODULES.find((m) => m.id === placed.moduleId)
      if (!pm) return false
      const pw = placed.rotation === 'horizontal' ? pm.width : pm.height
      const ph = placed.rotation === 'horizontal' ? pm.height : pm.width

      return x < placed.x + pw && x + w > placed.x && y < placed.y + ph && y + h > placed.y
    })
  }

  const addModuleToStation = (
    stationId: string,
    moduleId: string,
    x?: number,
    y?: number,
    rotation: 'horizontal' | 'vertical' = 'horizontal',
  ) => {
    const station = stations.value.find((s) => s.id === stationId)
    const module = STATION_MODULES.find((m) => m.id === moduleId)

    if (!station || !module) return { success: false, message: 'Station ou module introuvable' }

    if (!isModuleUnlocked(moduleId)) {
      return { success: false, message: 'Module non débloqué par la recherche' }
    }

    if (resourceStore.argent < module.cost.argent || resourceStore.science < module.cost.science) {
      return { success: false, message: 'Ressources insuffisantes' }
    }

    // If x and y are provided, check placement. If not, it's a legacy call (not visual)
    if (x !== undefined && y !== undefined) {
      if (!isModulePlacementPossible(stationId, moduleId, x, y, rotation)) {
        return { success: false, message: 'Emplacement invalide ou occupé' }
      }
    } else {
      // Automatic placement for legacy calls
      // Find a free spot or just stack them (visual designer should handle actual placement)
      x = 0
      y = 0 // fallback
      let found = false
      for (let ty = 0; ty < station.mapHeight; ty++) {
        for (let tx = 0; tx < station.mapWidth; tx++) {
          if (isModulePlacementPossible(stationId, moduleId, tx, ty, rotation)) {
            x = tx
            y = ty
            found = true
            break
          }
        }
        if (found) break
      }
    }

    resourceStore.addArgent(-module.cost.argent)
    resourceStore.addScience(-module.cost.science)

    station.placedModules.push({ x, y, moduleId, rotation })
    station.moduleIds = station.placedModules.map((m) => m.moduleId)
    return { success: true }
  }

  const removeModuleFromStation = (stationId: string, x: number, y: number) => {
    const station = stations.value.find((s) => s.id === stationId)
    if (!station) return { success: false, message: 'Station introuvable' }

    const index = station.placedModules.findIndex((m) => m.x === x && m.y === y)
    if (index === -1) return { success: false, message: 'Module introuvable' }

    const placed = station.placedModules[index]
    if (!placed) return { success: false, message: 'Module introuvable' }

    // Cannot remove command center if it's the only one
    if (
      placed.moduleId === 'command_center_basic' &&
      station.placedModules.filter((m) => m.moduleId === 'command_center_basic').length <= 1
    ) {
      return {
        success: false,
        message: 'Impossible de supprimer le dernier centre de commandement',
      }
    }

    station.placedModules.splice(index, 1)
    station.moduleIds = station.placedModules.map((m) => m.moduleId)

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

  const consumeStationResources = (daysPassed: number) => {
    stations.value.forEach((station) => {
      if (gameStore.elapsedDays >= station.constructionFinishedDay && station.resources) {
        const crewCount = station.astronautIds.length
        if (crewCount > 0 && station.resources) {
          station.resources.nourriture = Math.max(
            0,
            station.resources.nourriture - crewCount * daysPassed,
          )
          station.resources.eau = Math.max(0, station.resources.eau - crewCount * daysPassed)
          station.resources.o2 = Math.max(0, station.resources.o2 - crewCount * daysPassed)
        }
        station.resources.piecesDetachees = Math.max(
          0,
          station.resources.piecesDetachees - 0.5 * daysPassed,
        )
      }
    })
  }

  const addStationResources = (stationId: string, resources: Partial<StationResources>) => {
    const station = stations.value.find((s) => s.id === stationId)
    if (!station || !station.resources) return { success: false, message: 'Station introuvable' }

    if (resources.nourriture) station.resources.nourriture += resources.nourriture
    if (resources.eau) station.resources.eau += resources.eau
    if (resources.o2) station.resources.o2 += resources.o2
    if (resources.piecesDetachees) station.resources.piecesDetachees += resources.piecesDetachees

    return { success: true }
  }

  const addCivilianPopulation = (stationId: string, amount: number) => {
    const station = stations.value.find((s) => s.id === stationId)
    if (!station) return { success: false, message: 'Station introuvable' }

    station.civilianPopulation += amount
    return { success: true }
  }

  const growCivilianPopulation = (daysPassed: number) => {
    stations.value.forEach((station) => {
      if (
        station.orbitBodyId === 'mars' &&
        station.constructionFinishedDay <= gameStore.elapsedDays
      ) {
        if (station.civilianPopulation > 0 && station.resources) {
          const growthRate = 0.05 * daysPassed
          station.civilianPopulation += Math.floor(station.civilianPopulation * growthRate)
        }
      }
    })
  }

  return {
    stations,
    availableModules,
    unlockedModules,
    isModuleUnlocked,
    isStationConstructionUnlocked,
    totalPersonnelCapacity,
    marsCivilianPopulation,
    stationBonuses,
    stationConsumption,
    createStation,
    addModuleToStation,
    removeModuleFromStation,
    isModulePlacementPossible,
    assignAstronautToStation,
    removeAstronautFromStation,
    consumeStationResources,
    addStationResources,
    addCivilianPopulation,
    growCivilianPopulation,
  }
})
