import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBaseStore } from '../useBaseStore'
import { useResourceStore } from '../useResourceStore'

describe('Base Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const store = useBaseStore()
    // Reset by setting active base
    store.setActiveBase('earth-kourou', { minerals: 0.5, water: 0.5, energy: 0.5, science: 0.5 })
    // Reset parcels ref
    store.parcels.forEach((p) => (p.owned = false))
    store.calculateMapDimensions()
  })

  it('initializes with a central parcel owned', () => {
    const store = useBaseStore()
    expect(store.mapWidth).toBe(10)
    expect(store.mapHeight).toBe(10)
    expect(store.isTileInOwnedParcel(0, 0)).toBe(true)
    expect(store.isTileInOwnedParcel(5, 5)).toBe(true)
    expect(store.isTileInOwnedParcel(15, 15)).toBe(false)
  })

  it('buys a parcel and expands map dimensions', () => {
    const store = useBaseStore()
    const resourceStore = useResourceStore()

    const parcel = store.parcels.find((p) => p.id === 'parcel_right')!
    resourceStore.argent = parcel.cost.argent + 1000
    resourceStore.science = parcel.cost.science + 100

    const success = store.buyParcel(parcel.id)

    expect(success).toBe(true)
    expect(store.ownedParcels.has(parcel.id)).toBe(true)
    // mapWidth should increase from 10 to 20 (original 10 + new parcel 10)
    expect(store.mapWidth).toBe(20)
    expect(store.isTileInOwnedParcel(15, 5)).toBe(true)
  })

  it('places a building if resources are sufficient and space is free', () => {
    const store = useBaseStore()
    const resourceStore = useResourceStore()

    const hq = store.buildings.find((b) => b.id === 'hq')!
    resourceStore.argent = hq.cost.argent + 100
    resourceStore.science = hq.cost.science + 100

    const success = store.buildAndPlaceBuilding('hq', 0, 0)

    expect(success).toBe(true)
    expect(store.placedBuildings.length).toBe(1)
    expect(resourceStore.argent).toBe(100)
  })

  it('fails to place building on occupied tile (building collision)', () => {
    const store = useBaseStore()
    const resourceStore = useResourceStore()

    resourceStore.argent = 10000
    resourceStore.science = 10000

    store.buildAndPlaceBuilding('hq', 0, 0)
    const success = store.buildAndPlaceBuilding('lab', 1, 1) // HQ is 2x2 at (0,0)

    expect(success).toBe(false)
    expect(store.lastMessage).toContain('Espace deja occupe')
  })

  it('fails to place building outside owned parcels', () => {
    const store = useBaseStore()
    const resourceStore = useResourceStore()

    resourceStore.argent = 10000
    resourceStore.science = 10000

    // (15, 15) is outside the initial 10x10 central parcel
    const success = store.buildAndPlaceBuilding('hq', 15, 15)

    expect(success).toBe(false)
    expect(store.lastMessage).toContain('sort de la carte')
  })

  it('places a route and prevents building over it', () => {
    const store = useBaseStore()
    const resourceStore = useResourceStore()

    resourceStore.argent = 1000
    resourceStore.science = 1000

    // Place a 1x1 route
    store.buildAndPlaceRoute('route_small', 5, 5, 'horizontal')
    expect(store.placedRoutes.length).toBe(1)

    // Try to place a 2x2 HQ over it
    const success = store.buildAndPlaceBuilding('hq', 4, 4)
    expect(success).toBe(false)
    expect(store.lastMessage).toContain('Espace deja occupe par une route')
  })

  it('removes a building and frees up space', () => {
    const store = useBaseStore()
    const resourceStore = useResourceStore()

    resourceStore.argent = 1000
    resourceStore.science = 1000

    store.buildAndPlaceBuilding('hq', 0, 0)
    expect(store.placedBuildings.length).toBe(1)

    const removed = store.removeBuilding(1, 1) // Click inside the 2x2 HQ
    expect(removed).toBe(true)
    expect(store.placedBuildings.length).toBe(0)

    // Can now place something else there
    const success = store.buildAndPlaceBuilding('lab', 0, 0)
    expect(success).toBe(true)
  })

  it('calculates free tiles correctly', () => {
    const store = useBaseStore()
    const resourceStore = useResourceStore()

    // Initial: 1 parcel = 100 tiles
    expect(store.freeTiles).toBe(100)

    resourceStore.argent = 1000
    resourceStore.science = 1000

    // Place HQ (2x2 = 4 tiles)
    store.buildAndPlaceBuilding('hq', 0, 0)
    expect(store.freeTiles).toBe(96)

    // Ensure we have enough resources to buy parcel
    resourceStore.argent = 5000
    resourceStore.science = 5000

    // Buy a parcel (+100 tiles)
    const success = store.buyParcel('parcel_right')
    expect(success).toBe(true)
    expect(store.freeTiles).toBe(196)
  })

  it('detects adjacency bonus between power and lab if connected to road', () => {
    const store = useBaseStore()
    const resourceStore = useResourceStore()

    resourceStore.argent = 10000
    resourceStore.science = 10000

    store.buildAndPlaceBuilding('power', 0, 0)
    store.buildAndPlaceBuilding('lab', 1, 0)
    // Placer une route pour connecter les deux (entrée power: 0,1; entrée lab: 1,0)
    // La case (1,1) est adjacente à l'entrée de power (0,1) et à l'entrée de lab (1,0)
    store.buildAndPlaceRoute('route_small', 1, 1, 'horizontal')

    expect(store.adjacencyBonuses.activeBonuses.length).toBe(1)
    expect(store.adjacencyBonuses.totalSciencePerDay).toBe(1.1)
    expect(store.adjacencyBonuses.totalArgentPerDay).toBe(0)
    expect(store.adjacencyBonuses.totalCarburantPerDay).toBe(0)
  })

  it('does not trigger adjacency bonus when buildings are not connected to road', () => {
    const store = useBaseStore()
    const resourceStore = useResourceStore()

    resourceStore.argent = 10000
    resourceStore.science = 10000

    store.buildAndPlaceBuilding('power', 0, 0)
    store.buildAndPlaceBuilding('lab', 1, 0)

    expect(store.adjacencyBonuses.activeBonuses.length).toBe(0)
  })

  it('detects adjacency bonus when buildings are diagonal', () => {
    const store = useBaseStore()
    const resourceStore = useResourceStore()

    resourceStore.argent = 10000
    resourceStore.science = 10000

    store.buildAndPlaceBuilding('power', 0, 0)
    store.buildAndPlaceBuilding('lab', 2, 2)

    expect(store.adjacencyBonuses.activeBonuses.length).toBe(0)
    expect(store.adjacencyBonuses.totalSciencePerDay).toBe(0)
  })

  it('places a pipeline and allows building and route over it', () => {
    const store = useBaseStore()
    const resourceStore = useResourceStore()

    resourceStore.argent = 1000
    resourceStore.science = 1000

    // Place a pipeline
    const successPipe = store.buildAndPlacePipeline('pipe_basic', 5, 5, 'horizontal')
    expect(successPipe).toBe(true)
    expect(store.placedPipelines.length).toBe(1)

    // Route can be placed over a pipeline (pipeline passe sous les routes)
    const successRoute = store.buildAndPlaceRoute('route_small', 5, 5, 'horizontal')
    expect(successRoute).toBe(true)

    // Place another pipeline to verify building overlap separately
    const successSecondPipe = store.buildAndPlacePipeline('pipe_basic', 7, 7, 'horizontal')
    expect(successSecondPipe).toBe(true)

    // Building can be placed over a pipeline (pipeline passe sous les batiments)
    const successBuilding = store.buildAndPlaceBuilding('hq', 7, 7)
    expect(successBuilding).toBe(true)
  })

  it('removes a pipeline', () => {
    const store = useBaseStore()
    const resourceStore = useResourceStore()

    resourceStore.argent = 1000
    resourceStore.science = 1000

    store.buildAndPlacePipeline('pipe_basic', 5, 5, 'horizontal')
    expect(store.placedPipelines.length).toBe(1)

    const removed = store.removePipeline(5, 5)
    expect(removed).toBe(true)
    expect(store.placedPipelines.length).toBe(0)
  })
})
