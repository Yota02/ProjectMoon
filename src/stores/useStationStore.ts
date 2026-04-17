import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useResourceStore } from './useResourceStore'
import { useGameStore } from './useGameStore'
import { useResearchStore } from './useResearchStore'
import { gameEvents } from '@/engine/EventBus'
import { useEventStore } from './useEventStore'
import { useTrainingStore } from './useTrainingStore'

export type StationModuleType = 'housing' | 'science' | 'production' | 'storage' | 'command' | 'leisure' | 'shipyard' | 'mining'

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
    materiauxRaresPerDay?: number // Nouveau
    personnelCapacity?: number
    energiePerDay?: number
    energyCapacity?: number // Capacité de stockage d'énergie
    moralBoost?: number
    shielding?: number // Niveau de protection anti-radiation
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
  energie: number
  materiauxRares?: number // Nouveau
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
  maxEnergy: number
  mapWidth: number
  mapHeight: number
  mapOffsetX: number
  mapOffsetY: number
  civilianPopulation: number
  moral: number // 0 à 100
  isOnStrike: boolean
  isShielded: boolean // Si la station est protégée par un bouclier global
  owner?: 'player' | 'external'
  lastCrisisDay?: number
}

export const STATION_MODULES: StationModule[] = [
  {
    id: 'habitat_basic',
    name: 'Module Habitation Alpha',
    description: "Permet d'accueillir 2 astronautes. Consomme de l'énergie.",
    type: 'housing',
    cost: { argent: 500, science: 50 },
    researchId: 'c-station-habitat',
    bonuses: { personnelCapacity: 2, energiePerDay: -5, shielding: 5 },
    width: 2,
    height: 1,
    symbol: 'HB',
    colorClass: 'bg-blue-500/80 border-blue-300/80',
  },
  {
    id: 'lab_basic',
    name: 'Laboratoire de Microgravité',
    description: "Produit de la science chaque jour. Consomme beaucoup d'énergie.",
    type: 'science',
    cost: { argent: 800, science: 100 },
    researchId: 'c-station-lab',
    bonuses: { sciencePerDay: 5, energiePerDay: -15, shielding: 2 },
    width: 2,
    height: 1,
    symbol: 'LB',
    colorClass: 'bg-violet-500/80 border-violet-300/80',
  },
  {
    id: 'solar_panel_basic',
    name: 'Panneaux Solaires',
    description: "Génère de l'énergie pour la station (Uniquement le jour).",
    type: 'production',
    cost: { argent: 300, science: 30 },
    researchId: 'c-station-power',
    bonuses: { energiePerDay: 40 },
    width: 1,
    height: 2,
    symbol: 'SN',
    colorClass: 'bg-amber-500/80 border-amber-300/80',
  },
  {
    id: 'battery_park',
    name: 'Parc de Batteries',
    description: "Stocke l'énergie excédentaire pour la nuit.",
    type: 'storage',
    cost: { argent: 400, science: 20 },
    researchId: 'c-station-power',
    bonuses: { energyCapacity: 200 },
    width: 1,
    height: 1,
    symbol: 'BT',
    colorClass: 'bg-lime-500/80 border-lime-300/80',
  },
  {
    id: 'rtg_nuclear',
    name: 'Générateur RTG Nucléaire',
    description: "Produit une énergie constante, jour et nuit.",
    type: 'production',
    cost: { argent: 2000, science: 400 },
    researchId: 'm-nucleaire',
    bonuses: { energiePerDay: 15, shielding: 0 },
    width: 1,
    height: 1,
    symbol: 'NU',
    colorClass: 'bg-yellow-600/80 border-yellow-400/80',
  },
  {
    id: 'shield_generator',
    name: 'Bouclier Magnétique',
    description: "Protège la station contre les radiations solaires. Consomme de l'énergie.",
    type: 'command',
    cost: { argent: 3000, science: 600 },
    researchId: 'i-shields',
    bonuses: { energiePerDay: -25, shielding: 80 },
    width: 2,
    height: 2,
    symbol: 'SH',
    colorClass: 'bg-cyan-500/80 border-cyan-300/80',
  },
  {
    id: 'fuel_depot_basic',
    name: 'Dépôt de Carburant Orbital',
    description: "Produit du carburant. Consomme de l'énergie.",
    type: 'production',
    cost: { argent: 600, science: 80 },
    researchId: 'c-station-base',
    bonuses: { carburantPerDay: 2, energiePerDay: -12 },
    width: 2,
    height: 2,
    symbol: 'FD',
    colorClass: 'bg-rose-500/80 border-rose-300/80',
  },
  {
    id: 'drydock_orbital',
    name: 'Cale Sèche Orbitale',
    description: "Permet la construction de vaisseaux lourds directement dans l'espace.",
    type: 'shipyard',
    cost: { argent: 8000, science: 1500 },
    researchId: 'b-drydock',
    bonuses: { energyCapacity: 500, energiePerDay: -50, shielding: 20 },
    width: 4,
    height: 4,
    symbol: 'DD',
    colorClass: 'bg-slate-700/80 border-slate-500/80',
  },
  {
    id: 'mining_asteroid',
    name: "Module d'Extraction Astéroïdale",
    description: "Extrait des matériaux rares des astéroïdes capturés.",
    type: 'mining',
    cost: { argent: 5000, science: 800 },
    researchId: 'e-asteroid',
    bonuses: { materiauxRaresPerDay: 5, energiePerDay: -60 },
    width: 3,
    height: 3,
    symbol: 'MN',
    colorClass: 'bg-orange-800/80 border-orange-600/80',
  },
  {
    id: 'command_center_basic',
    name: 'Centre de Commandement',
    description: "Indispensable pour coordonner la station. Consomme de l'énergie.",
    type: 'command',
    cost: { argent: 1000, science: 200 },
    researchId: 'c-station-base',
    bonuses: { sciencePerDay: 2, argentPerDay: 5, energiePerDay: -10, shielding: 10 },
    width: 2,
    height: 2,
    symbol: 'HQ',
    colorClass: 'bg-indigo-500/80 border-indigo-300/80',
  },
  {
    id: 'jardin_botanique',
    name: 'Jardin Botanique Zéro-G',
    description: "Améliore le moral des colons et produit un peu d'O2.",
    type: 'leisure',
    cost: { argent: 1500, science: 300 },
    researchId: 'c-ferme',
    bonuses: { moralBoost: 2, energiePerDay: -15 },
    width: 3,
    height: 2,
    symbol: 'JB',
    colorClass: 'bg-emerald-500/80 border-emerald-300/80',
  },
  {
    id: 'cinema_spatial',
    name: 'Cinéma Holographique',
    description: "Grand divertissement pour les résidents. Bonus de moral important.",
    type: 'leisure',
    cost: { argent: 2500, science: 150 },
    researchId: 'e-tourism',
    bonuses: { moralBoost: 5, energiePerDay: -20 },
    width: 2,
    height: 2,
    symbol: 'CH',
    colorClass: 'bg-sky-500/80 border-sky-300/80',
  },
  {
    id: 'hotel_spatial',
    name: 'Hôtel de Luxe Orbital',
    description: "Attire des civils fortunés. Génère beaucoup d'argent via les impôts.",
    type: 'housing',
    cost: { argent: 5000, science: 100 },
    researchId: 'e-tourism',
    bonuses: { personnelCapacity: 10, argentPerDay: 50, moralBoost: 1, energiePerDay: -40 },
    width: 3,
    height: 3,
    symbol: 'HT',
    colorClass: 'bg-amber-600/80 border-amber-400/80',
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
            resources: { nourriture: 100, eau: 100, o2: 100, piecesDetachees: 50, energie: 500 },
            maxEnergy: 1000,
            mapWidth: 12,
            mapHeight: 12,
            mapOffsetX: 0,
            mapOffsetY: 0,
            civilianPopulation: 0,
            moral: 100,
            isOnStrike: false,
            isShielded: false,
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
            resources: { nourriture: 50, eau: 50, o2: 50, piecesDetachees: 25, energie: 200 },
            maxEnergy: 500,
            mapWidth: 12,
            mapHeight: 12,
            mapOffsetX: 0,
            mapOffsetY: 0,
            civilianPopulation: 0,
            moral: 100,
            isOnStrike: false,
            isShielded: false,
            owner: 'external',
          },
        ]
      : [],
  )
  const gameStore = useGameStore()
  const resourceStore = useResourceStore()
  const researchStore = useResearchStore()

  gameEvents.on('day-elapsed', ({ daysPassed, currentDate }) => {
    if (daysPassed <= 0) return
    const { argentPerDay, sciencePerDay, carburantPerDay, materiauxRaresPerDay } = stationBonuses.value

    if (argentPerDay !== 0) resourceStore.addArgent(argentPerDay * daysPassed)
    if (sciencePerDay !== 0) resourceStore.addScience(sciencePerDay * daysPassed)
    if (carburantPerDay !== 0) resourceStore.addCarburant(carburantPerDay * daysPassed)
    if (materiauxRaresPerDay !== 0) resourceStore.addMateriauxRares(materiauxRaresPerDay * daysPassed)

    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`
    consumeStationResources(daysPassed, formattedDate)
    growCivilianPopulation(daysPassed)
  })

  const availableModules = ref<StationModule[]>(STATION_MODULES)

  const isModuleUnlocked = (moduleId: string) => {
    const module = STATION_MODULES.find((m) => m.id === moduleId)
    if (!module || !module.researchId) return true
    return researchStore.completedResearchIds.includes(module.researchId)
  }

  const isStationConstructionUnlocked = computed(() => {
    return researchStore.completedResearchIds.includes('c-station-base')
  })

  // Nouveau : Débloque la logistique automatisée (5 stations ou plus)
  const isLogisticsUnlocked = computed(() => {
    return stations.value.filter(s => s.owner === 'player').length >= 5
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
    let materiauxRaresPerDay = 0
    
    // Stats d'énergie pour l'UI
    const energyStats: Record<string, { prod: number, cons: number, storage: number, shielding: number }> = {}

    stations.value.forEach((station) => {
      let sProd = 0
      let sCons = 0
      let sStorage = 50 // Base storage
      let sShielding = 0

      if (gameStore.elapsedDays >= station.constructionFinishedDay) {
        const isDay = Math.floor(gameStore.elapsedDays) % 2 === 0
        
        // Taxes civiles
        const taxPerColon = station.moral > 50 ? 1 : 0.5
        argentPerDay += station.civilianPopulation * taxPerColon

        station.placedModules.forEach((placed) => {
          const module = STATION_MODULES.find((m) => m.id === placed.moduleId)
          if (module) {
            argentPerDay += module.bonuses.argentPerDay || 0
            
            // Énergie
            const eBonus = module.bonuses.energiePerDay || 0
            if (eBonus > 0) {
              // Production : Solaire uniquement le jour (sauf RTG)
              if (module.id === 'solar_panel_basic') {
                if (isDay) sProd += eBonus
              } else {
                sProd += eBonus
              }
            } else {
              // Consommation (valeur négative)
              sCons += Math.abs(eBonus)
            }

            sStorage += module.bonuses.energyCapacity || 0
            sShielding += module.bonuses.shielding || 0

            // Science (uniquement si pas en grève ET si station alimentée)
            const hasEnergy = (station.resources?.energie || 0) > 0
            if (!station.isOnStrike && hasEnergy) {
              sciencePerDay += module.bonuses.sciencePerDay || 0
              materiauxRaresPerDay += module.bonuses.materiauxRaresPerDay || 0
            }
            carburantPerDay += module.bonuses.carburantPerDay || 0
          }
        })
      }
      
      energyStats[station.id] = { prod: sProd, cons: sCons, storage: sStorage, shielding: sShielding }
      // Update maxEnergy and isShielded reactively
      station.maxEnergy = sStorage
      station.isShielded = sShielding >= 50
    })

    return { argentPerDay, sciencePerDay, carburantPerDay, materiauxRaresPerDay, energyStats }
  })

  const stationConsumption = computed(() => {
    let nourriture = 0
    let eau = 0
    let o2 = 0
    let piecesDetachees = 0

    stations.value.forEach((station) => {
      if (gameStore.elapsedDays >= station.constructionFinishedDay) {
        // Consommation par astronaute
        nourriture += station.astronautIds.length * 1
        eau += station.astronautIds.length * 1
        o2 += station.astronautIds.length * 1

        // Consommation par civil (50% de plus que les astronautes)
        nourriture += station.civilianPopulation * 1.5
        eau += station.civilianPopulation * 1.5
        o2 += station.civilianPopulation * 1.5

        // Maintenance fixe
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
        energie: 200,
      },
      maxEnergy: 500,
      mapWidth: 12,
      mapHeight: 12,
      mapOffsetX: 0,
      mapOffsetY: 0,
      civilianPopulation: 0,
      moral: 100,
      isOnStrike: false,
      isShielded: false,
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

    // Restriction thématique : Module de minage uniquement en orbite lunaire ou haute
    if (module.id === 'mining_asteroid') {
       if (station.orbitBodyId !== 'moon' && station.orbitBodyId !== 'earth') {
         return { success: false, message: 'Le minage nécessite une orbite stable (Terre/Lune)' }
       }
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

  const consumeStationResources = (daysPassed: number, formattedDate: string) => {
    stations.value.forEach((station) => {
      if (gameStore.elapsedDays >= station.constructionFinishedDay && station.resources) {
        const crewCount = station.astronautIds.length
        const civilianCount = station.civilianPopulation
        const eStats = stationBonuses.value.energyStats[station.id]

        // --- GESTION DE L'ÉNERGIE ---
        if (eStats) {
          const netEnergy = (eStats.prod - eStats.cons) * daysPassed
          station.resources.energie = Math.max(
            0,
            Math.min(station.maxEnergy, station.resources.energie + netEnergy)
          )
        }

        const isBlackout = (station.resources.energie || 0) <= 0

        // Consommation de ressources de base
        if ((crewCount > 0 || civilianCount > 0) && station.resources) {
          // Les civils consomment 1.5x plus
          let totalConsumptionFactor = (crewCount * 0.5) + (civilianCount * 0.75)
          
          // En cas de blackout, le support vie est moins efficace (conso O2 x2)
          const o2Factor = isBlackout ? 2 : 1
          
          station.resources.nourriture = Math.max(
            0,
            station.resources.nourriture - totalConsumptionFactor * daysPassed,
          )
          
          const researchStore = useResearchStore()
          const isWaterRecycled = researchStore.completedResearchIds.includes('c-closed-loop')
          
          if (!isWaterRecycled) {
            station.resources.eau = Math.max(0, station.resources.eau - totalConsumptionFactor * daysPassed)
          }
          
          station.resources.o2 = Math.max(0, station.resources.o2 - (totalConsumptionFactor * o2Factor) * daysPassed)
        }
        station.resources.piecesDetachees = Math.max(
          0,
          station.resources.piecesDetachees - 0.25 * daysPassed,
        )

        // --- GESTION DU MORAL ---
        let moralChange = 0

        // Bonus passif des modules de loisir
        station.placedModules.forEach(placed => {
          const module = STATION_MODULES.find(m => m.id === placed.moduleId)
          if (module?.bonuses.moralBoost) {
            moralChange += module.bonuses.moralBoost * 0.1 * daysPassed
          }
        })

        // Malus si manque de ressources
        if (station.resources.o2 < 5) moralChange -= 2 * daysPassed
        if (station.resources.nourriture < 5) moralChange -= 1 * daysPassed
        if (station.resources.eau < 5) moralChange -= 1 * daysPassed
        if (isBlackout) {
          moralChange -= 5 * daysPassed
          if (Math.random() < 0.1 * daysPassed) {
             trainingStore.log(`[ALERTE] Blackout total sur ${station.name} ! Le moral s'effondre.`)
          }
        }
        
        // Malus de surpopulation (si pop > capacity)
        const capacity = station.placedModules.reduce((subTotal, placed) => {
          const module = STATION_MODULES.find((m) => m.id === placed.moduleId)
          return subTotal + (module?.bonuses.personnelCapacity || 0)
        }, 0)
        if (station.civilianPopulation > capacity) {
          moralChange -= 0.5 * daysPassed
        }

        station.moral = Math.min(100, Math.max(0, station.moral + moralChange))

        // --- GRÈVES ET EXODE ---
        if (station.moral < 20 && !station.isOnStrike) {
          station.isOnStrike = true
          gameEvents.emit('station-strike-started', { stationId: station.id, stationName: station.name })
          trainingStore.log(`[SOCIAL] Grève générale sur ${station.name} ! La production de Science est arrêtée.`)
        } else if (station.moral > 40 && station.isOnStrike) {
          station.isOnStrike = false
          trainingStore.log(`[SOCIAL] Fin de la grève sur ${station.name}. Les chercheurs reprennent le travail.`)
        }

        if (station.moral < 10 && station.civilianPopulation > 0) {
          const exodusRate = 0.05 * daysPassed // 5% de la pop part chaque jour
          const departures = Math.ceil(station.civilianPopulation * exodusRate)
          station.civilianPopulation -= departures
          if (departures > 0) {
            trainingStore.log(`[EXODE] ${departures} civils ont quitté ${station.name} pour la concurrence (moral trop bas).`)
          }
        }

        // --- ALERTS ---
        const threshold = 10
        if (station.resources.nourriture < threshold) {
          gameEvents.emit('station-low-resource', {
            stationId: station.id,
            stationName: station.name,
            resourceName: 'Nourriture',
            date: formattedDate,
          })
        }
        if (station.resources.eau < threshold) {
          gameEvents.emit('station-low-resource', {
            stationId: station.id,
            stationName: station.name,
            resourceName: 'Eau',
            date: formattedDate,
          })
        }
        if (station.resources.o2 < threshold) {
          gameEvents.emit('station-low-resource', {
            stationId: station.id,
            stationName: station.name,
            resourceName: 'Oxygène',
            date: formattedDate,
          })
        }

        // --- GESTION DES CRISES ---
        if (station.resources.o2 <= 0) {
          _handleOxygenCrisis(station, daysPassed)
        }
      }
    })
  }

  const _handleOxygenCrisis = (station: Station, daysPassed: number) => {
    // Les crises n'apparaissent qu'à partir de l'année 4 (2017)
    if (gameStore.currentYear < 2017) return

    if (station.astronautIds.length === 0 && station.civilianPopulation <= 0) {
      return
    }

    const eventStore = useEventStore()
    const trainingStore = useTrainingStore()

    // 1. Mortalité des civils (10% par jour d'absence d'O2)
    if (station.civilianPopulation > 0) {
      const mortalityRate = 0.10
      const deaths = Math.ceil(station.civilianPopulation * mortalityRate * daysPassed)
      station.civilianPopulation = Math.max(0, station.civilianPopulation - deaths)
    }

    // 2. Risque pour les astronautes (chance de perte progressive)
    if (station.astronautIds.length > 0) {
      // Pour simuler 1 mort tous les 3 jours d'asphyxie environ
      if (Math.random() < (0.33 * daysPassed)) {
        const victimIdIdx = Math.floor(Math.random() * station.astronautIds.length)
        const victimId = station.astronautIds[victimIdIdx]
        
        if (victimId !== undefined) {
          // Supprimer de la station
          station.astronautIds.splice(victimIdIdx, 1)
          // Supprimer du roster global (mort)
          trainingStore.astronauts = trainingStore.astronauts.filter(a => a.id !== victimId)
          trainingStore.log(`[CATASTROPHE] Un membre d'équipage de ${station.name} a succombé par manque d'O2.`)
        }
      }
    }

    // 3. Déclencher la modale d'événement (si pas déjà active et cooldown respecté)
    const currentDay = gameStore.elapsedDays
    const cooldown = 30 // Ne pas spammer l'événement plus d'une fois par mois (30 jours)
    
    if (!station.lastCrisisDay || (currentDay - station.lastCrisisDay) >= cooldown) {
      eventStore.triggerSpecificEvent('crisis-o2-runout')
      station.lastCrisisDay = currentDay
    }
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
      if (station.constructionFinishedDay <= gameStore.elapsedDays) {
        if (station.resources) {
          // Cap population growth by available housing
          const capacity = station.placedModules.reduce((subTotal, placed) => {
            const module = STATION_MODULES.find((m) => m.id === placed.moduleId)
            return subTotal + (module?.bonuses.personnelCapacity || 0)
          }, 0)
          
          const maxCivilian = capacity * 10 
          
          if (station.civilianPopulation < maxCivilian && station.moral > 40) {
            // Taux de croissance influencé par le moral
            const moralMultiplier = station.moral / 100
            const growthRate = 0.02 * moralMultiplier * daysPassed
            
            const floatGrowth = (station.civilianPopulation + 1) * growthRate
            const randomFactor = 0.8 + Math.random() * 0.4
            let growth = floatGrowth * randomFactor
            
            if (growth < 0.1 && daysPassed > 0) {
              growth = 0.1 * daysPassed
            }
            
            station.civilianPopulation = Math.min(maxCivilian, station.civilianPopulation + growth)
          }
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
    isLogisticsUnlocked,
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
}, {
})
