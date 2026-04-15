import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GameLoop } from '../GameLoop'

describe('GameLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // performance.now() and requestAnimationFrame are needed for GameLoop
    if (typeof window !== 'undefined') {
      vi.stubGlobal('performance', { now: vi.fn(() => Date.now()) })
      vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(cb, 16))
      vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id))
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('initializes with default values', () => {
    const loop = new GameLoop(1000)
    expect(loop.tickRate).toBe(1000)
    expect(loop.callbacks).toHaveLength(0)
    expect(loop.timerId).toBeNull()
  })

  it('adds tick handlers', () => {
    const loop = new GameLoop()
    const handler = vi.fn()
    loop.addTickHandler(handler)
    expect(loop.callbacks).toContain(handler)
  })

  it('executes callbacks on tick', async () => {
    const tickRate = 500
    const loop = new GameLoop(tickRate)
    const handler = vi.fn()
    loop.addTickHandler(handler)

    loop.start()
    
    // Advance time by tickRate
    vi.advanceTimersByTime(tickRate + 50)
    
    expect(handler).toHaveBeenCalled()
    const deltaTime = handler.mock.calls[0][0]
    expect(deltaTime).toBeGreaterThanOrEqual(tickRate)

    loop.stop()
  })

  it('stops the loop when stop is called', () => {
    const loop = new GameLoop(500)
    loop.start()
    expect(loop.timerId).not.toBeNull()
    loop.stop()
    expect(loop.timerId).toBeNull()
  })
})
