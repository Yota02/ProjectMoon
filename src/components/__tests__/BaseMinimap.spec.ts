import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BaseMinimap from '../BaseMinimap.vue'
import { useBaseStore } from '../../stores/useBaseStore'

describe('BaseMinimap.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the map container with correct dimensions', () => {
    const baseStore = useBaseStore()
    baseStore.mapWidth = 100
    baseStore.mapHeight = 100
    const scale = 5
    
    const wrapper = mount(BaseMinimap, {
      props: { scale }
    })
    
    const mapContainer = wrapper.find('.relative')
    expect(mapContainer.attributes('style')).toContain('width: 500px')
    expect(mapContainer.attributes('style')).toContain('height: 500px')
  })

  it('renders buildings placed in the store', () => {
    const baseStore = useBaseStore()
    // Add a mock building
    baseStore.buildings = [{
      id: 'b1',
      name: 'Test Building',
      width: 2,
      height: 2,
      colorClass: 'bg-red-500',
      description: 'Test',
      cost: 100,
      power: 10
    }]
    
    baseStore.placedBuildings.push({
      buildingId: 'b1',
      x: 10,
      y: 10,
      rotation: 'horizontal'
    })
    
    const scale = 6
    const wrapper = mount(BaseMinimap, {
      props: { scale }
    })
    
    const buildings = wrapper.findAll('.border-white\\/5')
    expect(buildings.length).toBe(1)
    expect(buildings[0].attributes('class')).toContain('bg-red-500')
    expect(buildings[0].attributes('style')).toContain('left: 60px') // 10 * 6
    expect(buildings[0].attributes('style')).toContain('top: 60px')
    expect(buildings[0].attributes('style')).toContain('width: 12px') // 2 * 6
  })

  it('renders parcels owned by the player', () => {
    const baseStore = useBaseStore()
    baseStore.parcels = [{
      id: 'p1',
      parcelX: 1,
      parcelY: 1,
      owned: true,
      cost: 50
    }]
    
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
