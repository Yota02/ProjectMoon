import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'

// Mock performance.now and requestAnimationFrame for GameLoop
vi.stubGlobal('performance', { now: vi.fn(() => Date.now()) })
vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(cb, 16))
vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: { render: () => null } },
    { path: '/base', name: 'base', component: { render: () => null } },
    { path: '/training', name: 'training', component: { render: () => null } },
    { path: '/missions', name: 'missions', component: { render: () => null } },
    { path: '/fleet', name: 'fleet', component: { render: () => null } },
    { path: '/rd', name: 'rd', component: { render: () => null } },
    { path: '/finance', name: 'finance', component: { render: () => null } },
  ],
})

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('mounts and renders properly', async () => {
    router.push('/')
    await router.isReady()
    
    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          BaseIcon: true,
          transition: false
        }
      }
    })
    
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('AEROCORP')
    expect(wrapper.text()).toContain('Tableau de Bord')
  })
})
