import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFleetStore } from '../useFleetStore'
import { useResourceStore } from '../useResourceStore'
import { useResearchStore } from '../useResearchStore'
import { useBaseStore } from '../useBaseStore'

describe('Fleet Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const baseStore = useBaseStore()
    baseStore.placedBuildings = []
    baseStore.placedRoutes = []
  })

  it('filters available designs based on research', () => {
    const fleetStore = useFleetStore()
    const researchStore = useResearchStore()
    
    expect(fleetStore.availableDesigns.length).toBe(0)
    
    // Complete research for micro-launcher
    researchStore.researches['l-micro'].status = 'completed'
    
    expect(fleetStore.availableDesigns.length).toBe(1)
    expect(fleetStore.availableDesigns[0].id).toBe('d-micro')
  })

  it('builds a ship and deducts cost', () => {
    const fleetStore = useFleetStore()
    const resourceStore = useResourceStore()
    
    const design = fleetStore.designs[0]
    resourceStore.argent = design.cost + 1000
    
    fleetStore.build(design.id)
    
    expect(fleetStore.items.length).toBe(1)
    expect(fleetStore.items[0].status).toBe('En construction')
    expect(resourceStore.argent).toBe(1000)
  })

  it('advances construction progress on tick', () => {
    const fleetStore = useFleetStore()
    const baseStore = useBaseStore()
    const resourceStore = useResourceStore()
    const design = fleetStore.designs[0] // 30 days construction time
    
    resourceStore.argent = 10000
    resourceStore.science = 10000
    
    // Need a connected launch pad for progress
    baseStore.buildAndPlaceBuilding('launch_pad', 0, 0)
    baseStore.buildAndPlaceRoute('route_small', 1, 2, 'horizontal')

    fleetStore.items.push({
      id: 'test-item',
      designId: design.id,
      name: 'Test',
      status: 'En construction',
      reliability: 80,
      constructionProgress: 0,
      constructionTime: 30
    })
    
    // tick(500) = 1 day passed
    // 1 day / 30 days = 3.33%
    fleetStore.tick(500)
    
    expect(fleetStore.items[0].constructionProgress).toBeCloseTo(3.33)
  })

  it('completes construction when progress reaches 100%', () => {
    const fleetStore = useFleetStore()
    const baseStore = useBaseStore()
    const resourceStore = useResourceStore()
    const design = fleetStore.designs[0]
    
    resourceStore.argent = 10000
    resourceStore.science = 10000
    
    // Need a connected launch pad for progress
    baseStore.buildAndPlaceBuilding('launch_pad', 0, 0)
    baseStore.buildAndPlaceRoute('route_small', 1, 2, 'horizontal')

    fleetStore.items.push({
      id: 'test-item',
      designId: design.id,
      name: 'Test',
      status: 'En construction',
      reliability: 80,
      constructionProgress: 99,
      constructionTime: 30
    })
    
    fleetStore.tick(500) // 1 more day
    
    expect(fleetStore.items[0].constructionProgress).toBe(100)
    expect(fleetStore.items[0].status).toBe('Prêt')
  })
})
