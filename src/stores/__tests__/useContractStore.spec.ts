import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useContractStore } from '../useContractStore'
import { useResourceStore } from '../useResourceStore'

describe('Contract Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default values', () => {
    const store = useContractStore()
    expect(store.availableContracts.length).toBeGreaterThan(0)
    expect(store.subsidies.length).toBeGreaterThan(0)
  })

  it('signs a subsidy and receives funds', () => {
    const store = useContractStore()
    const resourceStore = useResourceStore()
    const subsidy = store.subsidies.find(s => s.status === 'available')!
    
    const initialArgent = resourceStore.argent
    store.signSubsidy(subsidy.id)
    
    expect(subsidy.status).toBe('signed')
    expect(resourceStore.argent).toBe(initialArgent + subsidy.amount * 1000000)
  })

  it('accepts a contract and updates status', () => {
    const store = useContractStore()
    const resourceStore = useResourceStore()
    const contract = store.availableContracts[0]
    
    const initialArgent = resourceStore.argent
    store.acceptContract(contract.id)
    
    expect(contract.status).toBe('active')
    expect(resourceStore.argent).toBe(initialArgent + contract.reward)
  })

  it('triggers an event and unlocks subsidies', () => {
    const store = useContractStore()
    const eventId = 'spaceRace'
    const subsidy = store.subsidies.find(s => s.eventRequired === eventId)!
    
    expect(subsidy.status).toBe('locked')
    store.triggerEvent(eventId)
    expect(subsidy.status).toBe('available')
    expect(store.activeEvents).toContain(eventId)
  })

  it('cancels subsidies if reputation is low', () => {
    const store = useContractStore()
    // Find a USA subsidy and make it available for testing
    const usaSubsidy = store.subsidies.find(s => s.faction === 'USA')!
    usaSubsidy.status = 'available'
    
    store.signSubsidy(usaSubsidy.id)
    expect(usaSubsidy.status).toBe('signed')
    
    // Manually set it to test the logic
    store.factionsReputation.USA = 10
    store.checkGeopolitics()
    
    expect(usaSubsidy.status).toBe('locked')
  })
})
