import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useResourceStore } from './useResourceStore'
import { gameEvents } from '@/engine/EventBus'

export interface BuildingDefinition {
  id: string
  name: string
  symbol: string
  colorClass: string
  width: number
  height: number
  cost: {
    argent: number
    science: number
  }
  entranceOffset: { x: number; y: number } // relative to top-left
}

export interface RouteDefinition {
  id: string
  name: string
  symbol: string
  colorClass: string
  width: number // Nombre de cases de large
  cost: {
    argent: number
    science: number
  }
  minLauncherWidth: number // Largeur minimum de lanceur autorisée (0 = tous)
}

export interface PipelineDefinition {
  id: string
  name: string
  symbol: string
  colorClass: string
  cost: {
    argent: number
    science: number
  }
}

export interface PlacedBuilding {
  x: number // top-left x
  y: number // top-left y
  buildingId: string
  rotation: 'horizontal' | 'vertical'
}

export interface PlacedRoute {
  x: number
  y: number
  routeId: string
  direction: 'horizontal' | 'vertical'
}

export interface PlacedPipeline {
  x: number
  y: number
  pipelineId: string
  direction: 'horizontal' | 'vertical'
}

export interface ParcelDefinition {
  id: string
  name: string
  direction: 'top' | 'bottom' | 'left' | 'right'
  parcelX: number
  parcelY: number
  cost: {
    argent: number
    science: number
  }
  owned: boolean
}

export interface ActiveAdjacencyBonus {
  id: string
  name: string
  triggerCount: number
  argentPerDay: number
  sciencePerDay: number
  carburantPerDay: number
}

interface BuildingAdjacencyRule {
  id: string
  name: string
  sourceBuildingId: string
  targetBuildingId: string
  argentPerDay: number
  sciencePerDay: number
  carburantPerDay: number
}

const PARCELS: ParcelDefinition[] = [
  {
    id: 'parcel_top',
    name: 'Parcelle Nord',
    direction: 'top',
    parcelX: 0,
    parcelY: -1,
    cost: { argent: 1000, science: 50 },
    owned: false,
  },
  {
    id: 'parcel_bottom',
    name: 'Parcelle Sud',
    direction: 'bottom',
    parcelX: 0,
    parcelY: 1,
    cost: { argent: 1000, science: 50 },
    owned: false,
  },
  {
    id: 'parcel_left',
    name: 'Parcelle Ouest',
    direction: 'left',
    parcelX: -1,
    parcelY: 0,
    cost: { argent: 1000, science: 50 },
    owned: false,
  },
  {
    id: 'parcel_right',
    name: 'Parcelle Est',
    direction: 'right',
    parcelX: 1,
    parcelY: 0,
    cost: { argent: 1000, science: 50 },
    owned: false,
  },
]

const BUILDINGS: BuildingDefinition[] = [
  {
    id: 'hq',
    name: 'QG mission',
    symbol: 'QG',
    colorClass: 'bg-blue-500/80 border-blue-300/80',
    width: 2,
    height: 2,
    cost: { argent: 180, science: 30 },
    entranceOffset: { x: 1, y: 1 },
  },
  {
    id: 'lab',
    name: 'Laboratoire',
    symbol: 'LB',
    colorClass: 'bg-violet-500/80 border-violet-300/80',
    width: 2,
    height: 1,
    cost: { argent: 120, science: 70 },
    entranceOffset: { x: 0, y: 0 },
  },
  {
    id: 'power',
    name: 'Centrale',
    symbol: 'EN',
    colorClass: 'bg-amber-500/80 border-amber-300/80',
    width: 1,
    height: 2,
    cost: { argent: 90, science: 20 },
    entranceOffset: { x: 0, y: 1 },
  },
  {
    id: 'hangar',
    name: 'Hangar',
    symbol: 'HG',
    colorClass: 'bg-emerald-500/80 border-emerald-300/80',
    width: 3,
    height: 3,
    cost: { argent: 220, science: 45 },
    entranceOffset: { x: 1, y: 2 },
  },
  {
    id: 'training_center',
    name: 'Centre Entrainement',
    symbol: 'CE',
    colorClass: 'bg-orange-500/80 border-orange-300/80',
    width: 2,
    height: 2,
    cost: { argent: 150, science: 60 },
    entranceOffset: { x: 1, y: 1 },
  },
  {
    id: 'launch_pad',
    name: 'Pas de Lancement',
    symbol: 'PL',
    colorClass: 'bg-red-500/80 border-red-300/80',
    width: 3,
    height: 2,
    cost: { argent: 300, science: 80 },
    entranceOffset: { x: 1, y: 1 },
  },
  {
    id: 'warehouse',
    name: 'Entrepôt',
    symbol: 'WG',
    colorClass: 'bg-yellow-500/80 border-yellow-300/80',
    width: 3,
    height: 2,
    cost: { argent: 200, science: 30 },
    entranceOffset: { x: 1, y: 1 },
  },
  {
    id: 'factory',
    name: 'Usine',
    symbol: 'US',
    colorClass: 'bg-stone-500/80 border-stone-300/80',
    width: 3,
    height: 3,
    cost: { argent: 250, science: 50 },
    entranceOffset: { x: 1, y: 2 },
  },
  {
    id: 'radar',
    name: 'Radar',
    symbol: 'RD',
    colorClass: 'bg-indigo-500/80 border-indigo-300/80',
    width: 2,
    height: 2,
    cost: { argent: 180, science: 70 },
    entranceOffset: { x: 1, y: 1 },
  },
  {
    id: 'refinery',
    name: 'Raffinerie',
    symbol: 'RF',
    colorClass: 'bg-rose-500/80 border-rose-300/80',
    width: 2,
    height: 2,
    cost: { argent: 280, science: 90 },
    entranceOffset: { x: 1, y: 1 },
  },
  {
    id: 'medical',
    name: 'Centre Médical',
    symbol: 'CM',
    colorClass: 'bg-red-400/80 border-red-200/80',
    width: 2,
    height: 2,
    cost: { argent: 160, science: 80 },
    entranceOffset: { x: 1, y: 1 },
  },
  {
    id: 'generator',
    name: 'Générateur',
    symbol: 'GE',
    colorClass: 'bg-orange-400/80 border-orange-200/80',
    width: 2,
    height: 2,
    cost: { argent: 240, science: 60 },
    entranceOffset: { x: 1, y: 1 },
  },
  {
    id: 'mine',
    name: 'Mine Astéroïde',
    symbol: 'MA',
    colorClass: 'bg-slate-500/80 border-slate-300/80',
    width: 3,
    height: 3,
    cost: { argent: 350, science: 100 },
    entranceOffset: { x: 1, y: 2 },
  },
  {
    id: 'farm',
    name: 'Ferme Orbitale',
    symbol: 'FO',
    colorClass: 'bg-emerald-400/80 border-emerald-200/80',
    width: 3,
    height: 2,
    cost: { argent: 140, science: 40 },
    entranceOffset: { x: 1, y: 1 },
  },
  {
    id: 'fuel_storage',
    name: 'Stockage Carburant',
    symbol: 'SC',
    colorClass: 'bg-orange-600/80 border-orange-400/80',
    width: 2,
    height: 2,
    cost: { argent: 180, science: 25 },
    entranceOffset: { x: 1, y: 1 },
  },
  {
    id: 'workshop',
    name: 'Atelier',
    symbol: 'AT',
    colorClass: 'bg-slate-400/80 border-slate-200/80',
    width: 2,
    height: 2,
    cost: { argent: 160, science: 45 },
    entranceOffset: { x: 1, y: 1 },
  },
  {
    id: 'dormitory',
    name: 'Dortoir',
    symbol: 'DR',
    colorClass: 'bg-blue-400/80 border-blue-200/80',
    width: 3,
    height: 2,
    cost: { argent: 100, science: 15 },
    entranceOffset: { x: 1, y: 1 },
  },
  {
    id: 'control_room',
    name: 'Salle de Contrôle',
    symbol: 'CR',
    colorClass: 'bg-purple-400/80 border-purple-200/80',
    width: 2,
    height: 3,
    cost: { argent: 200, science: 55 },
    entranceOffset: { x: 1, y: 2 },
  },
]

const ROUTES: RouteDefinition[] = [
  {
    id: 'route_narrow',
    name: 'Sentier pietonnier',
    symbol: '-',
    colorClass: 'bg-slate-600/80 border-slate-400/80',
    width: 1,
    cost: { argent: 10, science: 0 },
    minLauncherWidth: 0, // Pietons uniquement (0 = pietons seulement)
  },
  {
    id: 'route_small',
    name: 'Chemin de service',
    symbol: '=',
    colorClass: 'bg-slate-500/80 border-slate-300/80',
    width: 1,
    cost: { argent: 25, science: 5 },
    minLauncherWidth: 1, // Petits lanceurs (1 case)
  },
  {
    id: 'route_medium',
    name: 'Route standard',
    symbol: '==',
    colorClass: 'bg-slate-400/80 border-slate-200/80',
    width: 2,
    cost: { argent: 50, science: 10 },
    minLauncherWidth: 2, // Lanceurs medium (2 cases)
  },
  {
    id: 'route_large',
    name: 'Avenue industrielle',
    symbol: '===',
    colorClass: 'bg-slate-300/80 border-white/80',
    width: 3,
    cost: { argent: 100, science: 20 },
    minLauncherWidth: 3, // Gros lanceurs (3 cases)
  },
]

const PIPELINES: PipelineDefinition[] = [
  {
    id: 'pipe_basic',
    name: 'Pipeline standard',
    symbol: 'O',
    colorClass: 'bg-cyan-600/80 border-cyan-400/80',
    cost: { argent: 15, science: 2 },
  },
  {
    id: 'pipe_reinforced',
    name: 'Pipeline renforce',
    symbol: 'OO',
    colorClass: 'bg-cyan-400/80 border-cyan-200/80',
    cost: { argent: 40, science: 15 },
  },
]

const BUILDING_ADJACENCY_RULES: BuildingAdjacencyRule[] = [
  {
    id: 'power_lab',
    name: 'Energie vers laboratoires',
    sourceBuildingId: 'power',
    targetBuildingId: 'lab',
    argentPerDay: 0,
    sciencePerDay: 1,
    carburantPerDay: 0,
  },
  {
    id: 'power_hangar',
    name: 'Support carburant hangar',
    sourceBuildingId: 'power',
    targetBuildingId: 'hangar',
    argentPerDay: 0,
    sciencePerDay: 0,
    carburantPerDay: 1,
  },
  {
    id: 'hq_lab',
    name: 'Coordination QG laboratoire',
    sourceBuildingId: 'hq',
    targetBuildingId: 'lab',
    argentPerDay: 1,
    sciencePerDay: 0,
    carburantPerDay: 0,
  },
  {
    id: 'power_launch_pad',
    name: 'Energie vers pas de lancement',
    sourceBuildingId: 'power',
    targetBuildingId: 'launch_pad',
    argentPerDay: 0,
    sciencePerDay: 0,
    carburantPerDay: 2,
  },
  {
    id: 'hq_launch_pad',
    name: 'Coordination pas de lancement',
    sourceBuildingId: 'hq',
    targetBuildingId: 'launch_pad',
    argentPerDay: 2,
    sciencePerDay: 0,
    carburantPerDay: 0,
  },
  {
    id: 'training_center_power',
    name: 'Energie vers centre entrainement',
    sourceBuildingId: 'power',
    targetBuildingId: 'training_center',
    argentPerDay: 0,
    sciencePerDay: 1,
    carburantPerDay: 0,
  },
  {
    id: 'refinery_power',
    name: 'Energie vers raffinerie',
    sourceBuildingId: 'power',
    targetBuildingId: 'refinery',
    argentPerDay: 0,
    sciencePerDay: 0,
    carburantPerDay: 3,
  },
  {
    id: 'factory_warehouse',
    name: 'Usine vers entrepôt',
    sourceBuildingId: 'factory',
    targetBuildingId: 'warehouse',
    argentPerDay: 2,
    sciencePerDay: 0,
    carburantPerDay: 0,
  },
  {
    id: 'power_generator',
    name: 'Energie vers générateur',
    sourceBuildingId: 'power',
    targetBuildingId: 'generator',
    argentPerDay: 1,
    sciencePerDay: 0,
    carburantPerDay: 0,
  },
  {
    id: 'mine_power',
    name: 'Energie vers mine',
    sourceBuildingId: 'power',
    targetBuildingId: 'mine',
    argentPerDay: 0,
    sciencePerDay: 1,
    carburantPerDay: 0,
  },
  {
    id: 'farm_power',
    name: 'Energie vers ferme',
    sourceBuildingId: 'power',
    targetBuildingId: 'farm',
    argentPerDay: 0,
    sciencePerDay: 0,
    carburantPerDay: 1,
  },
  {
    id: 'workshop_generator',
    name: 'Générateur vers atelier',
    sourceBuildingId: 'generator',
    targetBuildingId: 'workshop',
    argentPerDay: 2,
    sciencePerDay: 0,
    carburantPerDay: 0,
  },
  {
    id: 'control_room_power',
    name: 'Energie vers salle contrôle',
    sourceBuildingId: 'power',
    targetBuildingId: 'control_room',
    argentPerDay: 0,
    sciencePerDay: 1,
    carburantPerDay: 0,
  },
]

const rangesOverlap = (startA: number, endA: number, startB: number, endB: number): boolean => {
  return Math.max(startA, startB) <= Math.min(endA, endB)
}

export interface BaseState {
  zoneId: string
  resources: {
    minerals: number
    water: number
    energy: number
    science: number
  }
  placedBuildings: PlacedBuilding[]
  placedRoutes: PlacedRoute[]
  placedPipelines: PlacedPipeline[]
  ownedParcels: Set<string>
  mapWidth: number
  mapHeight: number
  mapOffsetX: number
  mapOffsetY: number
}

const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'test'

export const useBaseStore = defineStore('base', () => {
  const PARCEL_SIZE = 10
  
  const bases = ref<Record<string, BaseState>>({})
  const activeBaseId = ref<string>('earth-kourou')

  gameEvents.on('day-elapsed', ({ daysPassed }) => {
    if (daysPassed <= 0) return
    const resourceStore = useResourceStore()
    const { totalArgentPerDay, totalSciencePerDay, totalCarburantPerDay } = allBasesAdjacencyBonuses.value

    if (totalArgentPerDay !== 0) resourceStore.addArgent(totalArgentPerDay * daysPassed)
    if (totalSciencePerDay !== 0) resourceStore.addScience(totalSciencePerDay * daysPassed)
    if (totalCarburantPerDay !== 0) resourceStore.addCarburant(totalCarburantPerDay * daysPassed)
  })

  // Initialize Earth Kourou base
  if (!bases.value['earth-kourou']) {
    bases.value['earth-kourou'] = {
      zoneId: 'earth-kourou',
      resources: { minerals: 0.5, water: 0.8, energy: 0.9, science: 0.6 },
      placedBuildings: [],
      placedRoutes: [],
      placedPipelines: [],
      ownedParcels: new Set(['center']),
      mapWidth: PARCEL_SIZE,
      mapHeight: PARCEL_SIZE,
      mapOffsetX: 0,
      mapOffsetY: 0,
    }
  }

  const currentBase = computed(() => bases.value[activeBaseId.value])

  const mapOffsetX = computed(() => currentBase.value?.mapOffsetX ?? 0)
  const mapOffsetY = computed(() => currentBase.value?.mapOffsetY ?? 0)
  const mapWidth = computed(() => currentBase.value?.mapWidth ?? PARCEL_SIZE)
  const mapHeight = computed(() => currentBase.value?.mapHeight ?? PARCEL_SIZE)
  
  const parcels = ref<ParcelDefinition[]>(PARCELS.map((p) => ({ ...p, owned: isDebugMode })))
  
  const ownedParcels = computed(() => currentBase.value?.ownedParcels ?? new Set(['center']))
  
  const buildings = ref<BuildingDefinition[]>(BUILDINGS)
  const routes = ref<RouteDefinition[]>(ROUTES)
  const pipelines = ref<PipelineDefinition[]>(PIPELINES)
  
  const placedBuildings = computed(() => currentBase.value?.placedBuildings ?? [])
  const placedRoutes = computed(() => currentBase.value?.placedRoutes ?? [])
  const placedPipelines = computed(() => currentBase.value?.placedPipelines ?? [])
  
  const lastMessage = ref('Selectionnez un batiment puis cliquez sur une case libre.')

  const setActiveBase = (zoneId: string, zoneResources?: BaseState['resources']) => {
    if (!bases.value[zoneId]) {
      bases.value[zoneId] = {
        zoneId,
        resources: zoneResources || { minerals: 0.5, water: 0.5, energy: 0.5, science: 0.5 },
        placedBuildings: [],
        placedRoutes: [],
        placedPipelines: [],
        ownedParcels: new Set(['center']),
        mapWidth: PARCEL_SIZE,
        mapHeight: PARCEL_SIZE,
        mapOffsetX: 0,
        mapOffsetY: 0,
      }
    }
    activeBaseId.value = zoneId
  }

  if (isDebugMode && currentBase.value) {
    // Acheter toutes les parcelles
    parcels.value.forEach((p) => (p.owned = true))
    currentBase.value.ownedParcels = new Set(['center', ...PARCELS.map((p) => p.id)])

    // Placer les bâtiments automatiquement pour le debug dans une grille
    let currentX = -12
    let currentY = -12
    BUILDINGS.forEach((b) => {
      currentBase.value!.placedBuildings.push({
        x: currentX,
        y: currentY,
        buildingId: b.id,
        rotation: 'horizontal',
      })
      currentX += 6
      if (currentX > 12) {
        currentX = -12
        currentY += 6
      }
    })

    // Créer une grille de routes pour tout connecter
    // On aligne sur le pas de 6 des bâtiments
    for (let x = -18; x <= 18; x += 6) {
      for (let y = -18; y <= 18; y++) {
        currentBase.value!.placedRoutes.push({ x, y, routeId: 'route_medium', direction: 'vertical' })
      }
    }
    for (let y = -18; y <= 18; y += 6) {
      for (let x = -18; x <= 18; x++) {
        // Éviter les doublons aux intersections
        if (x % 6 !== 0) {
          currentBase.value!.placedRoutes.push({ x, y, routeId: 'route_medium', direction: 'horizontal' })
        }
      }
    }
  }

  // Batiments debloques (par defaut tous pour le moment)
  const unlockedBuildings = ref<Set<string>>(new Set(BUILDINGS.map((b) => b.id)))
  const unlockedRoutes = ref<Set<string>>(new Set(ROUTES.map((r) => r.id)))
  const unlockedPipelines = ref<Set<string>>(new Set(PIPELINES.map((p) => p.id)))

  const isTileInOwnedParcel = (x: number, y: number): boolean => {
    const parcelX = Math.floor(x / PARCEL_SIZE)
    const parcelY = Math.floor(y / PARCEL_SIZE)

    if (parcelX === 0 && parcelY === 0) {
      return true
    }

    return parcels.value.some(
      (parcel) => currentBase.value?.ownedParcels.has(parcel.id) && parcel.parcelX === parcelX && parcel.parcelY === parcelY,
    )
  }

  const getPlacedBuildingRect = (placed: PlacedBuilding) => {
    const buildingDef = buildings.value.find((item) => item.id === placed.buildingId)
    if (!buildingDef) return null
    const width = placed.rotation === 'horizontal' ? buildingDef.width : buildingDef.height
    const height = placed.rotation === 'horizontal' ? buildingDef.height : buildingDef.width
    return {
      id: placed.buildingId,
      left: placed.x,
      top: placed.y,
      right: placed.x + width - 1,
      bottom: placed.y + height - 1,
    }
  }

  const isTileRoad = (tx: number, ty: number): boolean => {
    return placedRoutes.value.some((pr) => {
      const prDef = routes.value.find((r) => r.id === pr.routeId)
      if (!prDef) return false
      const len = prDef.width
      if (pr.direction === 'horizontal') {
        return ty === pr.y && tx >= pr.x && tx < pr.x + len
      } else {
        return tx === pr.x && ty >= pr.y && ty < pr.y + len
      }
    })
  }

  const getBuildingEntrancePos = (placed: PlacedBuilding) => {
    const def = buildings.value.find((b) => b.id === placed.buildingId)
    if (!def) return { x: placed.x, y: placed.y }

    let relX = def.entranceOffset.x
    let relY = def.entranceOffset.y

    if (placed.rotation === 'vertical') {
      const oldRelX = relX
      relX = def.height - 1 - relY
      relY = oldRelX
    }

    return { x: placed.x + relX, y: placed.y + relY }
  }

  const isBuildingConnected = (placed: PlacedBuilding): boolean => {
    const entrance = getBuildingEntrancePos(placed)
    const neighbors = [
      { x: entrance.x - 1, y: entrance.y },
      { x: entrance.x + 1, y: entrance.y },
      { x: entrance.x, y: entrance.y - 1 },
      { x: entrance.x, y: entrance.y + 1 },
    ]

    return neighbors.some((n) => isTileRoad(n.x, n.y))
  }

  const arePlacedBuildingsAdjacent = (first: PlacedBuilding, second: PlacedBuilding): boolean => {
    const a = getPlacedBuildingRect(first)
    const b = getPlacedBuildingRect(second)
    if (!a || !b) return false

    const isHorizontallyAdjacent =
      (a.right + 1 === b.left || b.right + 1 === a.left) &&
      rangesOverlap(a.top, a.bottom, b.top, b.bottom)
    if (isHorizontallyAdjacent) return true

    const isVerticallyAdjacent =
      (a.bottom + 1 === b.top || b.bottom + 1 === a.top) &&
      rangesOverlap(a.left, a.right, b.left, b.right)
    return isVerticallyAdjacent
  }

  const countRuleTriggersForBase = (rule: BuildingAdjacencyRule, base: BaseState): number => {
    let triggerCount = 0
    const buildings = base.placedBuildings
    for (let i = 0; i < buildings.length; i++) {
      for (let j = i + 1; j < buildings.length; j++) {
        const first = buildings[i]
        const second = buildings[j]
        if (!first || !second || !arePlacedBuildingsAdjacent(first, second)) continue

        // On vérifie la connexion pour chaque bâtiment dans le contexte de sa base
        const isFirstConnected = isBuildingConnectedInBase(first, base)
        const isSecondConnected = isBuildingConnectedInBase(second, base)

        if (!isFirstConnected || !isSecondConnected) continue

        const matchesForward =
          first.buildingId === rule.sourceBuildingId && second.buildingId === rule.targetBuildingId
        const matchesBackward =
          first.buildingId === rule.targetBuildingId && second.buildingId === rule.sourceBuildingId
        if (matchesForward || matchesBackward) {
          triggerCount += 1
        }
      }
    }
    return triggerCount
  }

  const isBuildingConnectedInBase = (placed: PlacedBuilding, base: BaseState): boolean => {
    const entrance = getBuildingEntrancePos(placed)
    const neighbors = [
      { x: entrance.x - 1, y: entrance.y },
      { x: entrance.x + 1, y: entrance.y },
      { x: entrance.x, y: entrance.y - 1 },
      { x: entrance.x, y: entrance.y + 1 },
    ]

    return neighbors.some((n) => {
      return base.placedRoutes.some((pr) => {
        const prDef = routes.value.find((r) => r.id === pr.routeId)
        if (!prDef) return false
        const len = prDef.width
        if (pr.direction === 'horizontal') {
          return n.y === pr.y && n.x >= pr.x && n.x < pr.x + len
        } else {
          return n.x === pr.x && n.y >= pr.y && n.y < pr.y + len
        }
      })
    })
  }

  const allBasesAdjacencyBonuses = computed(() => {
    let totalArgentPerDay = 0
    let totalSciencePerDay = 0
    let totalCarburantPerDay = 0

    for (const baseId in bases.value) {
      const base = bases.value[baseId]
      if (!base) continue
      const zoneMult = base.resources

      for (const rule of BUILDING_ADJACENCY_RULES) {
        const triggerCount = countRuleTriggersForBase(rule, base)
        if (triggerCount <= 0) continue

        totalArgentPerDay += rule.argentPerDay * triggerCount * (0.5 + zoneMult.minerals)
        totalSciencePerDay += rule.sciencePerDay * triggerCount * (0.5 + zoneMult.science)
        totalCarburantPerDay += rule.carburantPerDay * triggerCount * (0.5 + (zoneMult.energy + zoneMult.water) / 2)
      }
    }

    return {
      totalArgentPerDay,
      totalSciencePerDay,
      totalCarburantPerDay,
    }
  })

  const adjacencyBonuses = computed(() => {
    if (!currentBase.value) return { activeBonuses: [], totalArgentPerDay: 0, totalSciencePerDay: 0, totalCarburantPerDay: 0 }
    
    const activeBonuses: ActiveAdjacencyBonus[] = []
    let totalArgentPerDay = 0
    let totalSciencePerDay = 0
    let totalCarburantPerDay = 0
    
    const zoneMult = currentBase.value.resources

    for (const rule of BUILDING_ADJACENCY_RULES) {
      const triggerCount = countRuleTriggersForBase(rule, currentBase.value)
      if (triggerCount <= 0) continue

      const argentPerDay = rule.argentPerDay * triggerCount * (0.5 + zoneMult.minerals)
      const sciencePerDay = rule.sciencePerDay * triggerCount * (0.5 + zoneMult.science)
      const carburantPerDay = rule.carburantPerDay * triggerCount * (0.5 + (zoneMult.energy + zoneMult.water) / 2)

      totalArgentPerDay += argentPerDay
      totalSciencePerDay += sciencePerDay
      totalCarburantPerDay += carburantPerDay

      activeBonuses.push({
        id: rule.id,
        name: rule.name,
        triggerCount,
        argentPerDay,
        sciencePerDay,
        carburantPerDay,
      })
    }

    return {
      activeBonuses,
      totalArgentPerDay,
      totalSciencePerDay,
      totalCarburantPerDay,
    }
  })

  const totalPlaced = computed(() => placedBuildings.value.length)

  const freeTiles = computed(() => {
    let occupiedCount = 0
    for (const p of placedBuildings.value) {
      const b = buildings.value.find((b) => b.id === p.buildingId)
      if (b) occupiedCount += b.width * b.height
    }
    for (const r of placedRoutes.value) {
      const route = routes.value.find((rout) => rout.id === r.routeId)
      if (route) {
        occupiedCount += route.width
      }
    }
    const ownedTileCount =
      (1 + (currentBase.value?.ownedParcels.size || 1) - 1) * PARCEL_SIZE * PARCEL_SIZE
    return ownedTileCount - occupiedCount
  })

  const mapBounds = computed(() => ({
    minX: mapOffsetX.value,
    minY: mapOffsetY.value,
    maxX: mapOffsetX.value + mapWidth.value - 1,
    maxY: mapOffsetY.value + mapHeight.value - 1,
  }))

  const isBuildingUnlocked = (buildingId: string): boolean => {
    return unlockedBuildings.value.has(buildingId)
  }

  const isRouteUnlocked = (routeId: string): boolean => {
    return unlockedRoutes.value.has(routeId)
  }

  const isPipelineUnlocked = (pipelineId: string): boolean => {
    return unlockedPipelines.value.has(pipelineId)
  }

  const canBuildBuilding = (buildingId: string): boolean => {
    if (!isBuildingUnlocked(buildingId)) return false
    const building = buildings.value.find((item) => item.id === buildingId)
    if (!building) return false
    const resourceStore = useResourceStore()
    return (
      resourceStore.argent >= building.cost.argent && resourceStore.science >= building.cost.science
    )
  }

  const canBuildRoute = (routeId: string): boolean => {
    if (!isRouteUnlocked(routeId)) return false
    const route = routes.value.find((item) => item.id === routeId)
    if (!route) return false
    const resourceStore = useResourceStore()
    return resourceStore.argent >= route.cost.argent && resourceStore.science >= route.cost.science
  }

  const canBuildPipeline = (pipelineId: string): boolean => {
    if (!isPipelineUnlocked(pipelineId)) return false
    const pipe = pipelines.value.find((item) => item.id === pipelineId)
    if (!pipe) return false
    const resourceStore = useResourceStore()
    return resourceStore.argent >= pipe.cost.argent && resourceStore.science >= pipe.cost.science
  }

  const buildAndPlaceBuilding = (
    buildingId: string,
    x: number,
    y: number,
    rotation: 'horizontal' | 'vertical' = 'horizontal',
  ): boolean => {
    if (!currentBase.value) return false
    const building = buildings.value.find((item) => item.id === buildingId)
    if (!building) {
      lastMessage.value = 'Batiment introuvable.'
      return false
    }

    if (!isBuildingUnlocked(buildingId)) {
      lastMessage.value = 'Batiment non debloque.'
      return false
    }

    const resourceStore = useResourceStore()
    if (
      resourceStore.argent < building.cost.argent ||
      resourceStore.science < building.cost.science
    ) {
      lastMessage.value = `Ressources insuffisantes pour ${building.name}.`
      return false
    }

    const width = rotation === 'horizontal' ? building.width : building.height
    const height = rotation === 'horizontal' ? building.height : building.width

    const bounds = mapBounds.value
    if (
      x < bounds.minX ||
      y < bounds.minY ||
      x + width - 1 > bounds.maxX ||
      y + height - 1 > bounds.maxY
    ) {
      lastMessage.value = 'Le batiment sort de la carte.'
      return false
    }

    for (let by = 0; by < height; by++) {
      for (let bx = 0; bx < width; bx++) {
        if (!isTileInOwnedParcel(x + bx, y + by)) {
          lastMessage.value = 'Cette case n appartient pas a une parcelle achetee.'
          return false
        }
      }
    }

    // Check collision
    for (let by = 0; by < height; by++) {
      for (let bx = 0; bx < width; bx++) {
        const checkX = x + bx
        const checkY = y + by

        const isOccupied = currentBase.value.placedBuildings.some((pb) => {
          const pbDef = buildings.value.find((b) => b.id === pb.buildingId)
          if (!pbDef) return false
          const pbWidth = pb.rotation === 'horizontal' ? pbDef.width : pbDef.height
          const pbHeight = pb.rotation === 'horizontal' ? pbDef.height : pbDef.width
          return (
            checkX >= pb.x && checkX < pb.x + pbWidth && checkY >= pb.y && checkY < pb.y + pbHeight
          )
        })

        if (isOccupied) {
          lastMessage.value = 'Espace deja occupe par un batiment.'
          return false
        }

        const hasRoute = currentBase.value.placedRoutes.some((pr) => {
          const prDef = routes.value.find((r) => r.id === pr.routeId)
          if (!prDef) return false
          const prLen = prDef.width
          const prEndX = pr.direction === 'horizontal' ? pr.x + prLen - 1 : pr.x
          const prEndY = pr.direction === 'vertical' ? pr.y + prLen - 1 : pr.y

          if (pr.direction === 'horizontal') {
            return checkX >= pr.x && checkX <= prEndX && checkY === pr.y
          } else {
            return checkY >= pr.y && checkY <= prEndY && checkX === pr.x
          }
        })

        if (hasRoute) {
          lastMessage.value = 'Espace deja occupe par une route.'
          return false
        }
      }
    }

    // Consommer ressources et placer
    resourceStore.addArgent(-building.cost.argent)
    resourceStore.addScience(-building.cost.science)
    currentBase.value.placedBuildings.push({ x, y, buildingId, rotation })
    lastMessage.value = `${building.name} place en (${x + 1}, ${y + 1}).`
    return true
  }

  const buildAndPlaceRoute = (
    routeId: string,
    x: number,
    y: number,
    direction: 'horizontal' | 'vertical',
  ): boolean => {
    if (!currentBase.value) return false
    const route = routes.value.find((item) => item.id === routeId)
    if (!route) {
      lastMessage.value = 'Route introuvable.'
      return false
    }

    if (!isRouteUnlocked(routeId)) {
      lastMessage.value = 'Route non debloquee.'
      return false
    }

    const resourceStore = useResourceStore()
    if (resourceStore.argent < route.cost.argent || resourceStore.science < route.cost.science) {
      lastMessage.value = `Ressources insuffisantes pour ${route.name}.`
      return false
    }

    const routeLen = route.width
    const endX = direction === 'horizontal' ? x + routeLen - 1 : x
    const endY = direction === 'vertical' ? y + routeLen - 1 : y

    const bounds = mapBounds.value
    if (x < bounds.minX || y < bounds.minY || endX > bounds.maxX || endY > bounds.maxY) {
      lastMessage.value = 'La route sort de la carte.'
      return false
    }

    for (let i = 0; i < routeLen; i++) {
      const checkX = direction === 'horizontal' ? x + i : x
      const checkY = direction === 'vertical' ? y + i : y
      if (!isTileInOwnedParcel(checkX, checkY)) {
        lastMessage.value = 'Cette case n appartient pas a une parcelle achetee.'
        return false
      }
    }

    // Check collision with buildings
    for (let i = 0; i < routeLen; i++) {
      const checkX = direction === 'horizontal' ? x + i : x
      const checkY = direction === 'vertical' ? y + i : y

      const hasBuilding = currentBase.value.placedBuildings.some((pb) => {
        const pbDef = buildings.value.find((b) => b.id === pb.buildingId)
        if (!pbDef) return false
        return (
          checkX >= pb.x &&
          checkX < pb.x + pbDef.width &&
          checkY >= pb.y &&
          checkY < pb.y + pbDef.height
        )
      })

      if (hasBuilding) {
        lastMessage.value = 'La route croise un batiment.'
        return false
      }
    }

    // Check collision with other routes
    for (let i = 0; i < routeLen; i++) {
      const checkX = direction === 'horizontal' ? x + i : x
      const checkY = direction === 'vertical' ? y + i : y

      const hasRoute = currentBase.value.placedRoutes.some((pr) => {
        const prDef = routes.value.find((r) => r.id === pr.routeId)
        if (!prDef) return false
        const prLen = prDef.width
        const prEndX = pr.direction === 'horizontal' ? pr.x + prLen - 1 : pr.x
        const prEndY = pr.direction === 'vertical' ? pr.y + prLen - 1 : pr.y

        if (pr.direction === 'horizontal') {
          return checkX >= pr.x && checkX <= prEndX && checkY === pr.y
        } else {
          return checkY >= pr.y && checkY <= prEndY && checkX === pr.x
        }
      })

      if (hasRoute) {
        lastMessage.value = 'Espace deja occupe par une route.'
        return false
      }
    }

    // Consommer ressources et placer
    resourceStore.addArgent(-route.cost.argent)
    resourceStore.addScience(-route.cost.science)
    currentBase.value.placedRoutes.push({ x, y, routeId, direction })
    lastMessage.value = `${route.name} placee en (${x + 1}, ${y + 1}).`
    return true
  }

  const buildAndPlacePipeline = (
    pipelineId: string,
    x: number,
    y: number,
    direction: 'horizontal' | 'vertical',
  ): boolean => {
    if (!currentBase.value) return false
    const pipe = pipelines.value.find((item) => item.id === pipelineId)
    if (!pipe) {
      lastMessage.value = 'Pipeline introuvable.'
      return false
    }

    if (!isPipelineUnlocked(pipelineId)) {
      lastMessage.value = 'Pipeline non debloque.'
      return false
    }

    const resourceStore = useResourceStore()
    if (resourceStore.argent < pipe.cost.argent || resourceStore.science < pipe.cost.science) {
      lastMessage.value = `Ressources insuffisantes pour ${pipe.name}.`
      return false
    }

    const bounds = mapBounds.value
    if (x < bounds.minX || y < bounds.minY || x > bounds.maxX || y > bounds.maxY) {
      lastMessage.value = 'Le pipeline sort de la carte.'
      return false
    }

    if (!isTileInOwnedParcel(x, y)) {
      lastMessage.value = 'Cette case n appartient pas a une parcelle achetee.'
      return false
    }

    // Check collision with other pipelines
    const hasPipe = currentBase.value.placedPipelines.some((pp) => {
      return x === pp.x && y === pp.y
    })

    if (hasPipe) {
      lastMessage.value = 'Espace deja occupe par un pipeline.'
      return false
    }

    // Consommer ressources et placer
    resourceStore.addArgent(-pipe.cost.argent)
    resourceStore.addScience(-pipe.cost.science)
    currentBase.value.placedPipelines.push({ x, y, pipelineId, direction })
    lastMessage.value = `${pipe.name} placee en (${x + 1}, ${y + 1}).`
    return true
  }

  const removeBuilding = (x: number, y: number): boolean => {
    if (!currentBase.value) return false
    const index = currentBase.value.placedBuildings.findIndex((pb) => {
      const pbDef = buildings.value.find((b) => b.id === pb.buildingId)
      if (!pbDef) return false
      const w = pb.rotation === 'horizontal' ? pbDef.width : pbDef.height
      const h = pb.rotation === 'horizontal' ? pbDef.height : pbDef.width
      return x >= pb.x && x < pb.x + w && y >= pb.y && y < pb.y + h
    })

    if (index === -1) {
      return false
    }

    const removed = currentBase.value.placedBuildings.splice(index, 1)[0]
    if (!removed) return false
    const bDef = buildings.value.find((b) => b.id === removed.buildingId)
    lastMessage.value = `${bDef?.name || 'Batiment'} retire de la base.`
    return true
  }

  const removeRoute = (x: number, y: number): boolean => {
    if (!currentBase.value) return false
    const index = currentBase.value.placedRoutes.findIndex((pr) => {
      const prDef = routes.value.find((r) => r.id === pr.routeId)
      if (!prDef) return false
      const len = prDef.width

      if (pr.direction === 'horizontal') {
        return y === pr.y && x >= pr.x && x < pr.x + len
      } else {
        return x === pr.x && y >= pr.y && y < pr.y + len
      }
    })

    if (index === -1) {
      return false
    }

    const removed = currentBase.value.placedRoutes.splice(index, 1)[0]
    if (!removed) return false
    const rDef = routes.value.find((r) => r.id === removed.routeId)
    lastMessage.value = `${rDef?.name || 'Route'} retiree.`
    return true
  }

  const removePipeline = (x: number, y: number): boolean => {
    if (!currentBase.value) return false
    const index = currentBase.value.placedPipelines.findIndex((pp) => {
      return pp.x === x && pp.y === y
    })

    if (index === -1) {
      return false
    }

    const removed = currentBase.value.placedPipelines.splice(index, 1)[0]
    if (!removed) return false
    const pDef = pipelines.value.find((p) => p.id === removed.pipelineId)
    lastMessage.value = `${pDef?.name || 'Pipeline'} retire.`
    return true
  }

  const calculateMapDimensions = () => {
    if (!currentBase.value) return
    const parcelCoords = [{ x: 0, y: 0 }]

    for (const parcel of parcels.value) {
      if (currentBase.value.ownedParcels.has(parcel.id)) {
        parcelCoords.push({ x: parcel.parcelX, y: parcel.parcelY })
      }
    }

    const minParcelX = Math.min(...parcelCoords.map((p) => p.x))
    const maxParcelX = Math.max(...parcelCoords.map((p) => p.x))
    const minParcelY = Math.min(...parcelCoords.map((p) => p.y))
    const maxParcelY = Math.max(...parcelCoords.map((p) => p.y))

    currentBase.value.mapOffsetX = minParcelX * PARCEL_SIZE
    currentBase.value.mapOffsetY = minParcelY * PARCEL_SIZE
    currentBase.value.mapWidth = (maxParcelX - minParcelX + 1) * PARCEL_SIZE
    currentBase.value.mapHeight = (maxParcelY - minParcelY + 1) * PARCEL_SIZE
  }

  const canBuyParcel = (parcelId: string): boolean => {
    if (!currentBase.value) return false
    const parcel = parcels.value.find((p) => p.id === parcelId)
    if (!parcel || currentBase.value.ownedParcels.has(parcelId)) return false
    const resourceStore = useResourceStore()
    return (
      resourceStore.argent >= parcel.cost.argent && resourceStore.science >= parcel.cost.science
    )
  }

  const buyParcel = (parcelId: string): boolean => {
    if (!currentBase.value) return false
    const parcel = parcels.value.find((p) => p.id === parcelId)
    if (!parcel) {
      lastMessage.value = 'Parcelle introuvable.'
      return false
    }
    if (currentBase.value.ownedParcels.has(parcelId)) {
      lastMessage.value = 'Parcelle deja posee.'
      return false
    }

    const resourceStore = useResourceStore()
    if (resourceStore.argent < parcel.cost.argent || resourceStore.science < parcel.cost.science) {
      lastMessage.value = `Ressources insuffisantes pour ${parcel.name}.`
      return false
    }

    resourceStore.addArgent(-parcel.cost.argent)
    resourceStore.addScience(-parcel.cost.science)
    currentBase.value.ownedParcels.add(parcelId)
    calculateMapDimensions()
    lastMessage.value = `${parcel.name} achetee!Taille: ${mapWidth.value}x${mapHeight.value}`
    return true
  }

  return {
    mapWidth,
    mapHeight,
    mapOffsetX,
    mapOffsetY,
    mapBounds,
    parcels,
    ownedParcels,
    calculateMapDimensions,
    buildings,
    routes,
    pipelines,
    placedBuildings,
    placedRoutes,
    placedPipelines,
    unlockedBuildings,
    unlockedRoutes,
    unlockedPipelines,
    lastMessage,
    totalPlaced,
    freeTiles,
    adjacencyBonuses,
    allBasesAdjacencyBonuses,
    isBuildingUnlocked,
    isRouteUnlocked,
    isPipelineUnlocked,
    canBuildBuilding,
    canBuildRoute,
    canBuildPipeline,
    isTileInOwnedParcel,
    buildAndPlaceBuilding,
    buildAndPlaceRoute,
    buildAndPlacePipeline,
    removeBuilding,
    removeRoute,
    removePipeline,
    canBuyParcel,
    buyParcel,
    isBuildingConnected,
    getBuildingEntrancePos,
    setActiveBase,
    activeBaseId,
  }
}, {
  persist: true
})

