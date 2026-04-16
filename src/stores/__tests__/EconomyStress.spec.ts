import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useResourceStore } from '../useResourceStore'
import { useGameStore } from '../useGameStore'
import { useStationStore } from '../useStationStore'
import { useBaseStore } from '../useBaseStore'
import { useResearchStore } from '../useResearchStore'
import { useFleetStore } from '../useFleetStore'
import { useSatelliteStore } from '../useSatelliteStore'
import { useTrainingStore } from '../useTrainingStore'

describe('Economy Stress Test', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('performance', { now: () => Date.now() })
  })

  it('simulates 10,000 days with active economy and population growth', () => {
    const gameStore = useGameStore()
    const resourceStore = useResourceStore()
    const stationStore = useStationStore()
    const baseStore = useBaseStore()
    const researchStore = useResearchStore()
    const fleetStore = useFleetStore()
    const satelliteStore = useSatelliteStore()
    const trainingStore = useTrainingStore()

    // 1. Unlock all researches
    Object.values(researchStore.researches).forEach(r => {
      r.status = 'completed'
    })

    resourceStore.argent = 1000000
    resourceStore.science = 10000

    // 2. Setup Base
    baseStore.setActiveBase('earth-kourou')
    baseStore.buildAndPlaceBuilding('hq', 0, 0)
    baseStore.buildAndPlaceBuilding('lab', 2, 0)
    baseStore.buildAndPlaceRoute('route_medium', 1, 1, 'horizontal')

    // 3. Setup Station
    const marsResult = stationStore.createStation('Mars Colony', 'mars')
    if (marsResult.success && marsResult.station) {
      const sId = marsResult.station.id
      stationStore.addModuleToStation(sId, 'solar_panel_basic', 0, 0)
      stationStore.addModuleToStation(sId, 'habitat_basic', 2, 0)
      stationStore.addModuleToStation(sId, 'habitat_basic', 4, 0)
      stationStore.addModuleToStation(sId, 'habitat_basic', 6, 0)
      stationStore.addModuleToStation(sId, 'habitat_basic', 8, 0)
      stationStore.addModuleToStation(sId, 'habitat_basic', 0, 2)
      stationStore.addModuleToStation(sId, 'habitat_basic', 2, 2)
      
      marsResult.station.civilianPopulation = 100
      marsResult.station.constructionFinishedDay = 0
      if (marsResult.station.resources) {
        marsResult.station.resources.o2 = 1000000
        marsResult.station.resources.nourriture = 1000000
        marsResult.station.resources.eau = 1000000
      }
    }

    // Verify initial bonuses
    const sBonuses = stationStore.stationBonuses
    const bBonuses = baseStore.allBasesAdjacencyBonuses
    console.log('Initial Station Bonuses:', sBonuses)
    console.log('Initial Base Bonuses:', bBonuses)
    
    // We expect at least CC + Solar = 5 + 10 = 15 argent/day
    expect(sBonuses.argentPerDay).toBeGreaterThanOrEqual(15)

    // 4. Simulation loop
    const daysToSimulate = 10000
    const deltaTime = 500 // 1 day per tick

    const initialArgent = resourceStore.argent

    for (let day = 1; day <= daysToSimulate; day++) {
      gameStore.tick(deltaTime)
      resourceStore.tick(deltaTime)
      researchStore.tick(deltaTime)
      fleetStore.tick(deltaTime)
      satelliteStore.tick(deltaTime)

      const population = stationStore.stations.reduce((acc, s) => acc + s.civilianPopulation, 0)
      
      if (Number.isNaN(resourceStore.argent)) throw new Error(`NaN Argent at day ${day}`)
      if (resourceStore.argent === Infinity) throw new Error(`Infinity Argent at day ${day}`)
      
      if (day % 1000 === 0) {
        console.log(`Day ${day}: Argent=${resourceStore.argent.toFixed(0)}, Pop=${Math.floor(population).toLocaleString()}`)
      }
    }

    const finalPopulation = stationStore.stations.reduce((acc, s) => acc + s.civilianPopulation, 0)
    console.log('Final Argent:', resourceStore.argent)
    console.log('Final Population:', Math.floor(finalPopulation))

    expect(resourceStore.argent).toBeGreaterThan(initialArgent)
    expect(finalPopulation).toBeGreaterThanOrEqual(120) 
    expect(Number.isFinite(finalPopulation)).toBe(true)
  })
})
