import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useResourceStore } from '../useResourceStore'

describe('Resource Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const store = useResourceStore()
    store.argent = 1000
    store.science = 0
    store.carburant = 0
  })

  it('initializes with default values', () => {
    const store = useResourceStore()
    expect(store.argent).toBe(1000)
    expect(store.science).toBe(0)
    expect(store.carburant).toBe(0)
  })

  it('adds argent correctly', () => {
    const store = useResourceStore()
    const initialArgent = store.argent
    store.addArgent(100)
    expect(store.argent).toBe(initialArgent + 100)
  })

  it('adds science correctly', () => {
    const store = useResourceStore()
    const initialScience = store.science
    store.addScience(50)
    expect(store.science).toBe(initialScience + 50)
  })

  it('adds carburant correctly', () => {
    const store = useResourceStore()
    store.addCarburant(200)
    expect(store.carburant).toBe(200)
  })

  it('updates resources on tick', () => {
    const store = useResourceStore()
    const initialScience = store.science
    const initialCarburant = store.carburant
    
    // tick(deltaTime) where daysPassed = deltaTime / 500
    // default production: science: 0, carburant: 1
    store.tick(1000) // 2 days passed
    
    expect(store.science).toBe(initialScience + store.production.science * 2)
    expect(store.carburant).toBe(initialCarburant + store.production.carburant * 2)
  })
})
