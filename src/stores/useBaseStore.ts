import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useResourceStore } from './useResourceStore'

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
  },
  {
    id: 'lab',
    name: 'Laboratoire',
    symbol: 'LB',
    colorClass: 'bg-violet-500/80 border-violet-300/80',
    width: 2,
    height: 1,
    cost: { argent: 120, science: 70 },
  },
  {
    id: 'power',
    name: 'Centrale',
    symbol: 'EN',
    colorClass: 'bg-amber-500/80 border-amber-300/80',
    width: 1,
    height: 2,
    cost: { argent: 90, science: 20 },
  },
  {
    id: 'hangar',
    name: 'Hangar',
    symbol: 'HG',
    colorClass: 'bg-emerald-500/80 border-emerald-300/80',
    width: 3,
    height: 3,
    cost: { argent: 220, science: 45 },
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

export const useBaseStore = defineStore('base', () => {
  const PARCEL_SIZE = 10
  const mapOffsetX = ref(0)
  const mapOffsetY = ref(0)
  const mapWidth = ref(PARCEL_SIZE)
  const mapHeight = ref(PARCEL_SIZE)
  const parcels = ref<ParcelDefinition[]>(PARCELS.map((p) => ({ ...p, owned: false })))
  const ownedParcels = ref<Set<string>>(new Set(['center']))
  const buildings = ref<BuildingDefinition[]>(BUILDINGS)
  const routes = ref<RouteDefinition[]>(ROUTES)
  const placedBuildings = ref<PlacedBuilding[]>([])
  const placedRoutes = ref<PlacedRoute[]>([])
  const lastMessage = ref('Selectionnez un batiment puis cliquez sur une case libre.')

  // Batiments debloques (par defaut tous pour le moment)
  const unlockedBuildings = ref<Set<string>>(new Set(BUILDINGS.map((b) => b.id)))
  const unlockedRoutes = ref<Set<string>>(new Set(ROUTES.map((r) => r.id)))

  const isTileInOwnedParcel = (x: number, y: number): boolean => {
    const parcelX = Math.floor(x / PARCEL_SIZE)
    const parcelY = Math.floor(y / PARCEL_SIZE)

    if (parcelX === 0 && parcelY === 0) {
      return true
    }

    return parcels.value.some(
      (parcel) => parcel.owned && parcel.parcelX === parcelX && parcel.parcelY === parcelY,
    )
  }

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
      (1 + parcels.value.filter((p) => p.owned).length) * PARCEL_SIZE * PARCEL_SIZE
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

  const buildAndPlaceBuilding = (
    buildingId: string,
    x: number,
    y: number,
    rotation: 'horizontal' | 'vertical' = 'horizontal',
  ): boolean => {
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

        const isOccupied = placedBuildings.value.some((pb) => {
          const pbDef = buildings.value.find((b) => b.id === pb.buildingId)
          if (!pbDef) return false
          const pbWidth = pb.rotation === 'horizontal' ? pbDef.width : pbDef.height
          const pbHeight = pb.rotation === 'horizontal' ? pbDef.height : pbDef.width
          return (
            checkX >= pb.x && checkX < pb.x + pbWidth && checkY >= pb.y && checkY < pb.y + pbHeight
          )
        })

        if (isOccupied) {
          lastMessage.value = 'Espace deja occupe.'
          return false
        }
      }
    }

    // Consommer ressources et placer
    resourceStore.addArgent(-building.cost.argent)
    resourceStore.addScience(-building.cost.science)
    placedBuildings.value.push({ x, y, buildingId, rotation })
    lastMessage.value = `${building.name} place en (${x + 1}, ${y + 1}).`
    return true
  }

  const buildAndPlaceRoute = (
    routeId: string,
    x: number,
    y: number,
    direction: 'horizontal' | 'vertical',
  ): boolean => {
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

      const hasBuilding = placedBuildings.value.some((pb) => {
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

      const hasRoute = placedRoutes.value.some((pr) => {
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
    placedRoutes.value.push({ x, y, routeId, direction })
    lastMessage.value = `${route.name} placee en (${x + 1}, ${y + 1}).`
    return true
  }

  const removeBuilding = (x: number, y: number): boolean => {
    const index = placedBuildings.value.findIndex((pb) => {
      const pbDef = buildings.value.find((b) => b.id === pb.buildingId)
      if (!pbDef) return false
      return x >= pb.x && x < pb.x + pbDef.width && y >= pb.y && y < pb.y + pbDef.height
    })

    if (index === -1) {
      return false
    }

    const removed = placedBuildings.value.splice(index, 1)[0]
    const bDef = buildings.value.find((b) => b.id === removed.buildingId)
    lastMessage.value = `${bDef?.name || 'Batiment'} retire de la base.`
    return true
  }

  const removeRoute = (x: number, y: number): boolean => {
    const index = placedRoutes.value.findIndex((pr) => {
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

    const removed = placedRoutes.value.splice(index, 1)[0]
    const rDef = routes.value.find((r) => r.id === removed.routeId)
    lastMessage.value = `${rDef?.name || 'Route'} retiree.`
    return true
  }

  const calculateMapDimensions = () => {
    const parcelCoords = [{ x: 0, y: 0 }]

    for (const parcel of parcels.value) {
      if (parcel.owned) {
        parcelCoords.push({ x: parcel.parcelX, y: parcel.parcelY })
      }
    }

    const minParcelX = Math.min(...parcelCoords.map((p) => p.x))
    const maxParcelX = Math.max(...parcelCoords.map((p) => p.x))
    const minParcelY = Math.min(...parcelCoords.map((p) => p.y))
    const maxParcelY = Math.max(...parcelCoords.map((p) => p.y))

    mapOffsetX.value = minParcelX * PARCEL_SIZE
    mapOffsetY.value = minParcelY * PARCEL_SIZE
    mapWidth.value = (maxParcelX - minParcelX + 1) * PARCEL_SIZE
    mapHeight.value = (maxParcelY - minParcelY + 1) * PARCEL_SIZE
  }

  const canBuyParcel = (parcelId: string): boolean => {
    const parcel = parcels.value.find((p) => p.id === parcelId)
    if (!parcel || parcel.owned) return false
    const resourceStore = useResourceStore()
    return (
      resourceStore.argent >= parcel.cost.argent && resourceStore.science >= parcel.cost.science
    )
  }

  const buyParcel = (parcelId: string): boolean => {
    const parcel = parcels.value.find((p) => p.id === parcelId)
    if (!parcel) {
      lastMessage.value = 'Parcelle introuvable.'
      return false
    }
    if (parcel.owned) {
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
    parcel.owned = true
    ownedParcels.value.add(parcelId)
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
    placedBuildings,
    placedRoutes,
    unlockedBuildings,
    unlockedRoutes,
    lastMessage,
    totalPlaced,
    freeTiles,
    isBuildingUnlocked,
    isRouteUnlocked,
    canBuildBuilding,
    canBuildRoute,
    isTileInOwnedParcel,
    buildAndPlaceBuilding,
    buildAndPlaceRoute,
    removeBuilding,
    removeRoute,
    canBuyParcel,
    buyParcel,
  }
})
