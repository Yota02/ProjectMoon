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
    
    gameStore.elapsedDays = 1100 // Year 2017 (Year 4)

    // This should not throw "TypeError: can't access property "_handleOxygenCrisis", (void 0) is undefined"
    expect(() => {
      stationStore.consumeStationResources(1)
    }).not.toThrow()
  })

  it('should NOT trigger crisis before Year 4 (2017)', () => {
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
    
    gameStore.elapsedDays = 1 // Year 2014
    stationStore.consumeStationResources(1)
    expect(stationStore.stations[0].lastCrisisDay).toBeUndefined()
  })

  it('should only trigger crisis event once every 30 days in Year 4+', () => {
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
    
    gameStore.elapsedDays = 1100 // Year 2017
    expect(gameStore.currentYear).toBe(2017)
    stationStore.consumeStationResources(1, '01/01/2017')
    expect(stationStore.stations[0].lastCrisisDay).toBe(1100)
    
    gameStore.elapsedDays = 1101
    stationStore.consumeStationResources(1, '02/01/2017')
    // Should NOT have updated lastCrisisDay (it was already 1100)
    expect(stationStore.stations[0].lastCrisisDay).toBe(1100)

    gameStore.elapsedDays = 1132
    expect(gameStore.currentYear).toBe(2017)
    stationStore.consumeStationResources(1, '01/02/2017')
    
    // Debug: If this fails, let's see why
    expect(stationStore.stations[0].lastCrisisDay).toBe(1132)
  })

  it('should NOT trigger crisis if station is empty even in Year 4', () => {
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
    
    gameStore.elapsedDays = 1100 // Year 2017
    stationStore.consumeStationResources(1, '01/01/2017')
    
    // Should NOT have a lastCrisisDay because the function returned early
    expect(stationStore.stations[0].lastCrisisDay).toBeUndefined()
  })
})
