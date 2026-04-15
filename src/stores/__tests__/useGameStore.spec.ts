import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../useGameStore'
import { useResourceStore } from '../useResourceStore'
import { useContractStore } from '../useContractStore'

describe('Game Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default values', () => {
    const store = useGameStore()
    expect(store.elapsedDays).toBe(0)
    expect(store.isSpaceRaceActive).toBe(false)
    expect(store.formattedDate).toBe('01/01/2014')
  })

  it('advances time on tick', () => {
    const store = useGameStore()
    store.tick(500) // 500ms = 1 day
    expect(store.elapsedDays).toBe(1)
    expect(store.dayTimer).toBe(0)
    expect(store.formattedDate).toBe('02/01/2014')
  })

  it('handles multiple days in one tick', () => {
    const store = useGameStore()
    store.tick(1500) // 3 days
    expect(store.elapsedDays).toBe(3)
    expect(store.dayTimer).toBe(0)
  })

  it('triggers monthly revenue', () => {
    const gameStore = useGameStore()
    const contractStore = useContractStore()
    const resourceStore = useResourceStore()
    
    // Mock a monthly revenue
    // We need to sign a subsidy or activate a contract
    const subsidy = contractStore.subsidies[0]
    contractStore.signSubsidy(subsidy.id)
    const monthlyRevenue = contractStore.totalMonthlyRevenue
    expect(monthlyRevenue).toBeGreaterThan(0)

    const initialArgent = resourceStore.argent
    
    // Advance 31 days (more than a month)
    gameStore.tick(31 * 500)
    
    expect(gameStore.elapsedDays).toBe(31)
    expect(resourceStore.argent).toBe(initialArgent + monthlyRevenue * 1000000)
  })

  it('triggers space race event', () => {
    const store = useGameStore()
    // startDate is 2014. spaceRaceStartYear is 2018.
    // 4 years = 365 * 4 = 1460 days.
    // 1460 * 500ms = 730,000ms
    store.tick(1500 * 500) // Way more than 4 years
    
    expect(store.currentYear).toBeGreaterThanOrEqual(2018)
    expect(store.isSpaceRaceActive).toBe(true)
    
    const contractStore = useContractStore()
    expect(contractStore.activeEvents).toContain('spaceRace')
  })
})
