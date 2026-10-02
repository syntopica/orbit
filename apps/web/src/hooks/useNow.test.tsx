import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useNow } from './useNow'

describe('useNow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-02T10:00:00.000Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('ticks with the clock', () => {
    const { result } = renderHook(() => useNow(1_000))
    const start = result.current
    act(() => {
      vi.advanceTimersByTime(3_000)
    })
    expect(result.current).toBe(start + 3_000)
  })
  it('clears its interval on unmount', () => {
    const { unmount } = renderHook(() => useNow(1_000))
    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
