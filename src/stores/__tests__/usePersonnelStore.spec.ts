import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePersonnelStore } from '../usePersonnelStore'
import { useResourceStore } from '../useResourceStore'

describe('Personnel Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('hires staff and deducts cost', () => {
    const store = usePersonnelStore()
    const resourceStore = useResourceStore()
    
    resourceStore.argent = 1000
    const initialHiringCost = store.staff.ingenieur.hiringCost
    
    const success = store.hire('ingenieur')
    
    expect(success).toBe(true)
    expect(store.staff.ingenieur.count).toBe(1)
    expect(resourceStore.argent).toBe(1000 - initialHiringCost)
    // Hiring cost should increase
    expect(store.staff.ingenieur.hiringCost).toBeGreaterThan(initialHiringCost)
  })

  it('fails to hire if funds are insufficient', () => {
    const store = usePersonnelStore()
    const resourceStore = useResourceStore()
    
    resourceStore.argent = 10 // Less than hiring cost
    const success = store.hire('ingenieur')
    
    expect(success).toBe(false)
    expect(store.staff.ingenieur.count).toBe(0)
    expect(store.logs[0].message).toContain('Fonds insuffisants')
  })

  it('increases science production when hiring scientists', () => {
    const store = usePersonnelStore()
    const resourceStore = useResourceStore()
    
    resourceStore.argent = 1000
    const initialProduction = resourceStore.production.science
    
    store.hire('scientifique')
    
    expect(resourceStore.production.science).toBe(initialProduction + 1)
  })

  it('runs research protocol and adds science', () => {
    const store = usePersonnelStore()
    const resourceStore = useResourceStore()
    
    // Need a scientist first
    resourceStore.argent = 1000
    store.hire('scientifique')
    
    resourceStore.carburant = 100
    const initialScience = resourceStore.science
    
    const success = store.runResearchProtocol()
    
    expect(success).toBe(true)
    expect(resourceStore.science).toBeGreaterThan(initialScience)
  })

  it('builds refinery and increases fuel production', () => {
    const store = usePersonnelStore()
    const resourceStore = useResourceStore()
    
    // Need a constructor first
    resourceStore.argent = 1000
    store.hire('constructeur')
    
    resourceStore.carburant = 100
    const initialFuelProd = resourceStore.production.carburant
    
    const success = store.buildRefinery()
    
    expect(success).toBe(true)
    expect(store.raffineries).toBe(1)
    expect(resourceStore.production.carburant).toBe(initialFuelProd + 1)
  })
})
