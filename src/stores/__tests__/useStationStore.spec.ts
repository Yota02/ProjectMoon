import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStationStore } from '../useStationStore'
import { useGameStore } from '../useGameStore'

// Need to mock before imports if they are used in the module scope, 
// but here we can mock it specifically for the tests.
vi.mock('../useEventStore', () => ({
    useEventStore: vi.fn(() => ({
        triggerSpecificEvent: vi.fn()
    }))
}))

describe('useStationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should consume station resources and not throw error when O2 is 0', () => {
    const stationStore = useStationStore()
    const gameStore = useGameStore()
    
    // Add a station with 0 O2
    stationStore.stations = [{
      id: 'test-station',
      name: 'Test Station',
      orbitBodyId: 'earth',
      moduleIds: [],
      placedModules: [],
      astronautIds: [1],
      level: 1,
      constructionFinishedDay: 0,
      resources: {
        nourriture: 10,
        eau: 10,
        o2: 0, // 0 O2 to trigger crisis
        piecesDetachees: 10
      },
      mapWidth: 10,
      mapHeight: 10,
      mapOffsetX: 0,
      mapOffsetY: 0,
      civilianPopulation: 0
    }]
    
    gameStore.elapsedDays = 1

    // This should not throw "TypeError: can't access property "_handleOxygenCrisis", (void 0) is undefined"
    expect(() => {
      stationStore.consumeStationResources(1)
    }).not.toThrow()
  })

  it('should only trigger crisis event once every 30 days', () => {
    const stationStore = useStationStore()
    const gameStore = useGameStore()
    
    stationStore.stations = [{
      id: 'test-station',
      name: 'Test Station',
      orbitBodyId: 'earth',
      moduleIds: [],
      placedModules: [],
      astronautIds: [1],
      level: 1,
      constructionFinishedDay: 0,
      resources: { nourriture: 10, eau: 10, o2: 0, piecesDetachees: 10 },
      mapWidth: 10, mapHeight: 10, mapOffsetX: 0, mapOffsetY: 0,
      civilianPopulation: 0
    }]
    
    gameStore.elapsedDays = 1
    stationStore.consumeStationResources(1)
    expect(stationStore.stations[0].lastCrisisDay).toBe(1)
    
    gameStore.elapsedDays = 2
    stationStore.consumeStationResources(1)
    // Should NOT have updated lastCrisisDay (it was already 1)
    expect(stationStore.stations[0].lastCrisisDay).toBe(1)

    gameStore.elapsedDays = 32
    stationStore.consumeStationResources(1)
    // Should HAVE updated lastCrisisDay to 32
    expect(stationStore.stations[0].lastCrisisDay).toBe(32)
  })

  it('should NOT trigger crisis if station is empty', () => {
    const stationStore = useStationStore()
    const gameStore = useGameStore()
    
    stationStore.stations = [{
      id: 'empty-station',
      name: 'Empty Station',
      orbitBodyId: 'earth',
      moduleIds: [],
      placedModules: [],
      astronautIds: [], // Empty
      level: 1,
      constructionFinishedDay: 0,
      resources: { nourriture: 0, eau: 0, o2: 0, piecesDetachees: 0 },
      mapWidth: 10, mapHeight: 10, mapOffsetX: 0, mapOffsetY: 0,
      civilianPopulation: 0 // Empty
    }]
    
    gameStore.elapsedDays = 1
    stationStore.consumeStationResources(1)
    
    // Should NOT have a lastCrisisDay because the function returned early
    expect(stationStore.stations[0].lastCrisisDay).toBeUndefined()
  })
})
