import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTrainingStore } from '../useTrainingStore'
import { useResourceStore } from '../useResourceStore'

describe('Training Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with a market of candidates', () => {
    const store = useTrainingStore()
    expect(store.market.length).toBe(8)
    expect(store.nextAstronautId).toBeGreaterThan(8)
  })

  it('recruits an astronaut from the market', () => {
    const store = useTrainingStore()
    const resourceStore = useResourceStore()
    
    const candidate = store.market[0]
    resourceStore.argent = candidate.cost + 1000
    
    const success = store.recruitFromMarket(candidate.id)
    
    expect(success).toBe(true)
    expect(store.astronauts.length).toBe(1)
    expect(store.astronauts[0].id).toBe(candidate.id)
    expect(resourceStore.argent).toBe(1000)
    // Market should be replenished
    expect(store.market.length).toBe(8)
  })

  it('fails to recruit if funds are insufficient', () => {
    const store = useTrainingStore()
    const resourceStore = useResourceStore()
    
    const candidate = store.market[0]
    resourceStore.argent = candidate.cost - 1
    
    const success = store.recruitFromMarket(candidate.id)
    
    expect(success).toBe(false)
    expect(store.astronauts.length).toBe(0)
    expect(store.logs[0].message).toContain('Fonds insuffisants')
  })

  it('refreshes the market', () => {
    const store = useTrainingStore()
    const resourceStore = useResourceStore()
    
    const initialMarketIds = store.market.map(c => c.id)
    resourceStore.argent = 500
    
    const success = store.refreshMarket()
    
    expect(success).toBe(true)
    const newMarketIds = store.market.map(c => c.id)
    expect(newMarketIds).not.toEqual(initialMarketIds)
    expect(resourceStore.argent).toBe(500 - 120)
  })

  it('starts training program', () => {
    const store = useTrainingStore()
    const resourceStore = useResourceStore()
    
    resourceStore.argent = 1000
    resourceStore.carburant = 1000
    
    const success = store.startTrainingProgram()
    
    expect(success).toBe(true)
    expect(store.activeSessions).toBe(1)
    expect(resourceStore.argent).toBe(1000 - 100)
    expect(resourceStore.carburant).toBe(1000 - 20)
  })
})
