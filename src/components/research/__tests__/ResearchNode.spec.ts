import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ResearchNode from '../ResearchNode.vue'
import type { ResearchNode as ResearchNodeType } from '../../../stores/useResearchStore'

describe('ResearchNode.vue', () => {
  const mockResearch: ResearchNodeType = {
    id: 'l-micro',
    name: 'Micro-Lanceurs',
    description: 'Capacité de lancer de petits satellites.',
    category: 'Lanceurs',
    cost: 20,
    duration: 10,
    progress: 0,
    status: 'available',
    prerequisites: [],
    tier: 0
  }

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders research info correctly', () => {
    const wrapper = mount(ResearchNode, {
      props: {
        research: mockResearch,
        hasActiveResearch: false
      },
      global: {
        stubs: {
          BaseIcon: true
        }
      }
    })

    expect(wrapper.text()).toContain('Micro-Lanceurs')
    expect(wrapper.text()).toContain('Capacité de lancer de petits satellites')
    expect(wrapper.find('button').text()).toContain('Rechercher')
  })

  it('emits start event when button is clicked', async () => {
    const wrapper = mount(ResearchNode, {
      props: {
        research: mockResearch,
        hasActiveResearch: false
      },
      global: {
        stubs: {
          BaseIcon: true
        }
      }
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('start')).toBeTruthy()
    expect(wrapper.emitted('start')![0]).toEqual(['l-micro'])
  })

  it('disables button if another research is active', () => {
    const wrapper = mount(ResearchNode, {
      props: {
        research: mockResearch,
        hasActiveResearch: true
      },
      global: {
        stubs: {
          BaseIcon: true
        }
      }
    })

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.text()).toContain('Déjà occupé')
  })

  it('shows progress when researching', () => {
    const researchingTask = { ...mockResearch, status: 'researching' as const, progress: 45 }
    const wrapper = mount(ResearchNode, {
      props: {
        research: researchingTask,
        hasActiveResearch: true
      },
      global: {
        stubs: {
          BaseIcon: true
        }
      }
    })

    expect(wrapper.text()).toContain('45%')
    expect(wrapper.find('.bg-blue-500').attributes('style')).toContain('width: 45%')
  })

  it('shows locked state and prerequisites', () => {
    const lockedTask = { ...mockResearch, status: 'locked' as const, prerequisites: ['pre-req-1'] }
    const wrapper = mount(ResearchNode, {
      props: {
        research: lockedTask,
        hasActiveResearch: false
      },
      global: {
        stubs: {
          BaseIcon: true
        }
      }
    })

    expect(wrapper.text()).toContain('Verrouillé')
    expect(wrapper.text()).toContain('Requis :')
  })
})
