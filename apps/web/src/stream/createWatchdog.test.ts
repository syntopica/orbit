import { describe, expect, it, vi } from 'vitest'

import { createWatchdog } from './createWatchdog'

describe('createWatchdog', () => {
  it('fires after silence and not while fed', () => {
    vi.useFakeTimers()
    const fire = vi.fn()
    const dog = createWatchdog(1000, fire)
    vi.advanceTimersByTime(900)
    dog.reset()
    vi.advanceTimersByTime(900)
    expect(fire).not.toHaveBeenCalled()
    vi.advanceTimersByTime(200)
    expect(fire).toHaveBeenCalledTimes(1)
    dog.stop()
    vi.useRealTimers()
  })
  it('restarts the countdown on every reset', () => {
    vi.useFakeTimers()
    const fire = vi.fn()
    const dog = createWatchdog(1000, fire)
    dog.reset()
    vi.advanceTimersByTime(500)
    dog.reset()
    vi.advanceTimersByTime(600)
    expect(fire).not.toHaveBeenCalled()
    dog.stop()
    vi.advanceTimersByTime(2000)
    expect(fire).not.toHaveBeenCalled()
    vi.useRealTimers()
  })
})
