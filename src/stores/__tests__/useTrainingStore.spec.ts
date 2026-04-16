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

    const initialCount = store.astronauts.length
    const candidate = store.market[0]
    resourceStore.argent = candidate.cost + 1000

    const success = store.recruitFromMarket(candidate.id)

    expect(success).toBe(true)
    expect(store.astronauts.length).toBe(initialCount + 1)
    expect(store.astronauts[initialCount]!.id).toBe(candidate.id)
    expect(resourceStore.argent).toBe(1000)
    // Market should be replenished
    expect(store.market.length).toBe(8)
  })

  it('fails to recruit if funds are insufficient', () => {
    const store = useTrainingStore()
    const resourceStore = useResourceStore()

    const initialCount = store.astronauts.length
    const candidate = store.market[0]
    resourceStore.argent = candidate.cost - 1

    const success = store.recruitFromMarket(candidate.id)

    expect(success).toBe(false)
    expect(store.astronauts.length).toBe(initialCount)
    expect(store.logs[0].message).toContain('Fonds insuffisants')
  })

  it('refreshes the market', () => {
    const store = useTrainingStore()
    const resourceStore = useResourceStore()

    const initialMarketIds = store.market.map((c) => c.id)
    resourceStore.argent = 500

    const success = store.refreshMarket()

    expect(success).toBe(true)
    const newMarketIds = store.market.map((c) => c.id)
    expect(newMarketIds).not.toEqual(initialMarketIds)
    expect(resourceStore.argent).toBe(500 - 120)
  })

  it('starts training program', () => {
    const store = useTrainingStore()
    const resourceStore = useResourceStore()

    const initialAstronauts = store.astronauts.length
    if (initialAstronauts === 0) {
      store.astronauts.push({
        id: 999,
        name: 'Test Astronaut',
        nationality: 'Test',
        flag: '🇫🇷',
        experience: 'Junior',
        type: 'pilote',
        cost: 100,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        status: 'disponible',
        skills: {
          pilotage: 10,
          ingenierie: 5,
          medecine: 5,
          science: 5,
        },
      })
    }

    const availableAstronaut = store.astronauts.find((a) => a.status === 'disponible')
    expect(availableAstronaut).toBeDefined()

    resourceStore.argent = 1000
    resourceStore.carburant = 1000

    const success = store.startTrainingProgram()

    expect(success).toBe(true)
    expect(store.activeTrainingSessions.length).toBeGreaterThan(0)
    expect(resourceStore.argent).toBeLessThan(1000)
  })
})
