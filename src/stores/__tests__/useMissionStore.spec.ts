import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMissionStore } from '../useMissionStore'
import { useResourceStore } from '../useResourceStore'
import { usePersonnelStore } from '../usePersonnelStore'
import { useFleetStore } from '../useFleetStore'

describe('Mission Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fails to launch without a launcher', () => {
    const store = useMissionStore()
    store.launchMission(1, 'non-existent')
    expect(store.logs[0].message).toContain('ERREUR')
    expect(store.logs[0].message).toContain('lanceur valide est requis')
  })

  it('fails to launch if launcher is not ready', () => {
    const store = useMissionStore()
    const fleetStore = useFleetStore()
    
    fleetStore.items.push({
      id: 'l1',
      designId: 'd-micro',
      name: 'Test Launcher',
      status: 'En construction',
      reliability: 90,
      constructionProgress: 50,
      constructionTime: 30
    })
    
    store.launchMission(1, 'l1')
    expect(store.logs[0].message).toContain('pas prêt')
  })

  it('fails if launcher cannot reach required orbit', () => {
    const store = useMissionStore()
    const fleetStore = useFleetStore()
    
    // Mission 2 requires LUNAR
    fleetStore.items.push({
      id: 'l1',
      designId: 'd-micro', // d-micro only supports LEO
      name: 'Micro',
      status: 'Prêt',
      reliability: 90,
      constructionProgress: 100,
      constructionTime: 30
    })
    
    store.launchMission(2, 'l1')
    expect(store.logs[0].message).toContain('ne peut pas atteindre l\'orbite LUNAR')
  })

  it('successfully launches a mission and consumes non-reusable launcher', () => {
    const store = useMissionStore()
    const fleetStore = useFleetStore()
    const resourceStore = useResourceStore()
    const personnelStore = usePersonnelStore()
    
    // Setup state
    personnelStore.staff.ingenieur.count = 1
    resourceStore.argent = 10000000
    resourceStore.carburant = 1000
    
    fleetStore.items.push({
      id: 'l1',
      designId: 'd-micro',
      name: 'Micro',
      status: 'Prêt',
      reliability: 100,
      constructionProgress: 100,
      constructionTime: 30
    })
    
    // Force success
    vi.spyOn(Math, 'random').mockReturnValue(0.1)
    
    store.launchMission(1, 'l1')
    
    expect(store.logs[0].message).toContain('SUCCÈS')
    expect(resourceStore.science).toBeGreaterThan(0)
    // Non-reusable launcher should be removed
    expect(fleetStore.items.find(i => i.id === 'l1')).toBeUndefined()
    
    vi.restoreAllMocks()
  })

  it('handles mission failure', () => {
    const store = useMissionStore()
    const fleetStore = useFleetStore()
    const resourceStore = useResourceStore()
    const personnelStore = usePersonnelStore()
    
    personnelStore.staff.ingenieur.count = 1
    resourceStore.argent = 10000000
    resourceStore.carburant = 1000
    
    fleetStore.items.push({
      id: 'l1',
      designId: 'd-micro',
      name: 'Micro',
      status: 'Prêt',
      reliability: 10, // Very low reliability
      constructionProgress: 100,
      constructionTime: 30
    })
    
    // Force failure
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    
    store.launchMission(1, 'l1')
    
    expect(store.logs[0].message).toContain('ÉCHEC')
    
    vi.restoreAllMocks()
  })

  it('sets reusable launcher to maintenance after mission', () => {
    const store = useMissionStore()
    const fleetStore = useFleetStore()
    const resourceStore = useResourceStore()
    const personnelStore = usePersonnelStore()
    
    personnelStore.staff.ingenieur.count = 1
    resourceStore.argent = 10000000
    resourceStore.carburant = 1000
    
    // Starship is reusable
    fleetStore.items.push({
      id: 's1',
      designId: 'd-starship',
      name: 'Starship One',
      status: 'Prêt',
      reliability: 98,
      constructionProgress: 100,
      constructionTime: 480
    })
    
    store.launchMission(1, 's1')
    
    const launcher = fleetStore.items.find(i => i.id === 's1')!
    expect(launcher.status).toBe('En maintenance')
    expect(launcher.reliability).toBeLessThan(98)
  })
})
