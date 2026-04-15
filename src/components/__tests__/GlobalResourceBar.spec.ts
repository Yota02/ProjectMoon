import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import GlobalResourceBar from '../GlobalResourceBar.vue'
import { useResourceStore } from '../../stores/useResourceStore'
import { useContractStore } from '../../stores/useContractStore'

describe('GlobalResourceBar.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders initial resource values', () => {
    const resourceStore = useResourceStore()
    resourceStore.argent = 1234567
    resourceStore.science = 888
    resourceStore.carburant = 99
    
    const wrapper = mount(GlobalResourceBar)
    
    // Check for the numbers without being strict about the separator (space vs comma)
    const text = wrapper.text().replace(/\s/g, ' ') // normalize spaces
    expect(text).toMatch(/1.234.567/) // regex for any separator
    expect(text).toContain('888')
    expect(text).toContain('99')
  })

  it('displays correct production trends', () => {
    const resourceStore = useResourceStore()
    const contractStore = useContractStore()
    
    resourceStore.production.science = 5
    resourceStore.production.carburant = 12
    
    // Total monthly revenue comes from contract store
    const subsidy = contractStore.subsidies[0]
    contractStore.signSubsidy(subsidy.id)
    const expectedRevenue = contractStore.totalMonthlyRevenue
    
    const wrapper = mount(GlobalResourceBar)
    
    expect(wrapper.text()).toContain('+5/s')
    expect(wrapper.text()).toContain('+12/s')
    expect(wrapper.text()).toContain(`+${expectedRevenue.toFixed(0)}M/mois`)
  })

  it('updates values when store changes', async () => {
    const resourceStore = useResourceStore()
    const wrapper = mount(GlobalResourceBar)
    
    resourceStore.argent = 5000
    // Wait for Vue to update the DOM
    await wrapper.vm.$nextTick()
    
    const text = wrapper.text().replace(/\s/g, ' ')
    expect(text).toMatch(/5.000/)
  })
})
