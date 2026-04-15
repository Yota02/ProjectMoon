import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useResearchStore } from '../useResearchStore'
import { useResourceStore } from '../useResourceStore'
import { useGameStore } from '../useGameStore'

describe('Research Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with some researches available', () => {
    const store = useResearchStore()
    const available = Object.values(store.researches).filter(r => r.status === 'available')
    expect(available.length).toBeGreaterThan(0)
    expect(available.find(r => r.id === 'l-micro')).toBeDefined()
  })

  it('starts research if science is sufficient', () => {
    const store = useResearchStore()
    const resourceStore = useResourceStore()
    
    const research = store.researches['l-micro']
    resourceStore.science = research.cost + 100
    
    store.startResearch('l-micro')
    
    expect(research.status).toBe('researching')
    expect(store.activeResearchId).toBe('l-micro')
    expect(resourceStore.science).toBe(100)
  })

  it('fails to start research if science is insufficient', () => {
    const store = useResearchStore()
    const resourceStore = useResourceStore()
    
    const research = store.researches['l-micro']
    resourceStore.science = research.cost - 5
    
    store.startResearch('l-micro')
    
    expect(research.status).toBe('available')
    expect(store.activeResearchId).toBeNull()
  })

  it('advances research progress on tick', () => {
    const store = useResearchStore()
    const research = store.researches['l-micro']
    research.status = 'researching'
    store.activeResearchId = 'l-micro'
    
    // duration for l-micro is 10s
    // tick(1000) = 1s = 10% progress
    store.tick(1000)
    
    expect(research.progress).toBeCloseTo(10)
  })

  it('completes research and unlocks prerequisites', () => {
    const store = useResearchStore()
    const micro = store.researches['l-micro']
    const medium = store.researches['l-medium']
    
    expect(medium.status).toBe('locked')
    
    store.completeResearch('l-micro')
    
    expect(micro.status).toBe('completed')
    expect(medium.status).toBe('available')
  })

  it('applies difficulty multiplier based on year', () => {
    const store = useResearchStore()
    const gameStore = useGameStore()
    
    // l-micro tier 0 is 2014. If current year is 2014, mult is 1.
    gameStore.elapsedDays = 0 // 2014
    expect(store.getDifficultyMultiplier('l-micro')).toBe(1)
    
    // If year is 2010 (hypothetically), it's in advance? Wait.
    // TIER_YEARS[0] = 2014. If current year is 2014, diff = 0.
    // If current year is 2013, diff = 1. Multiplier = 1 + 1 * 0.2 = 1.2
    gameStore.startDate = new Date(2013, 0, 1)
    expect(store.getDifficultyMultiplier('l-micro')).toBe(1.2)
    
    // If current year is 2015, diff = -1. Multiplier = 1 / (1 + 1*0.1) = 0.909...
    gameStore.startDate = new Date(2015, 0, 1)
    expect(store.getDifficultyMultiplier('l-micro')).toBeLessThan(1)
  })
})
