import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BaseMinimap from '../BaseMinimap.vue'
import { useBaseStore } from '../../stores/useBaseStore'
import { useResourceStore } from '../../stores/useResourceStore'

describe('BaseMinimap.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the map container with correct dimensions', () => {
    const baseStore = useBaseStore()
    // Default is 10x10
    const scale = 5
    
    const wrapper = mount(BaseMinimap, {
      props: { scale }
    })
    
    const mapContainer = wrapper.find('.relative')
    expect(mapContainer.attributes('style')).toContain('width: 50px')
    expect(mapContainer.attributes('style')).toContain('height: 50px')
  })

  it('renders buildings placed in the store', () => {
    const baseStore = useBaseStore()
    const resourceStore = useResourceStore()
    // Add a mock building
    baseStore.buildings = [{
      id: 'b1',
      name: 'Test Building',
      symbol: 'TB',
      width: 2,
      height: 2,
      colorClass: 'bg-red-500',
      cost: { argent: 0, science: 0 },
      entranceOffset: { x: 0, y: 0 }
    }]
    
    baseStore.setActiveBase('test-zone')
    baseStore.unlockedBuildings.add('b1')
    // No need to set resources if cost is 0, but good practice
    resourceStore.argent = 1000
    const success = baseStore.buildAndPlaceBuilding('b1', 0, 0)
    expect(success).toBe(true)
    
    const scale = 6
    const wrapper = mount(BaseMinimap, {
      props: { scale }
    })
    
    const buildings = wrapper.findAll('.border-white\\/5')
    expect(buildings.length).toBe(1)
    expect(buildings[0].attributes('class')).toContain('bg-red-500')
    expect(buildings[0].attributes('style')).toContain('left: 0px')
    expect(buildings[0].attributes('style')).toContain('top: 0px')
    expect(buildings[0].attributes('style')).toContain('width: 12px') // 2 * 6
  })

  it('renders parcels owned by the player', () => {
    const baseStore = useBaseStore()
    baseStore.parcels = [{
      id: 'p1',
      name: 'Test Parcel',
      direction: 'top',
      parcelX: 1,
      parcelY: 1,
      owned: false,
      cost: { argent: 50, science: 0 }
    }]
    
    baseStore.setActiveBase('test-zone')
    // Buy/Add p1 to ownedParcels
    baseStore.ownedParcels.add('p1')
    
    const wrapper = mount(BaseMinimap, {
      props: { scale: 10 }
    })
    
    // There's always a center parcel (0,0) plus our p1
    const parcels = wrapper.findAll('.bg-slate-800\\/40')
    expect(parcels.length).toBe(2)
  })

  it('renders the view rectangle when viewBounds are provided', () => {
    const viewBounds = { x: 100, y: 100, w: 200, h: 200 }
    const wrapper = mount(BaseMinimap, {
      props: { 
        viewBounds,
        scale: 10,
        tileSize: 48
      }
    })
    
    const viewRect = wrapper.find('.border-white\\/40')
    expect(viewRect.exists()).toBe(true)
  })
})
