import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useMediaQuery } from './useMediaQuery'

const QUERY = '(max-width: 767px)'

describe('useMediaQuery', () => {
  const listeners = new Set<() => void>()
  const add = vi.fn((_type: string, listener: () => void) => {
    listeners.add(listener)
  })
  const remove = vi.fn((_type: string, listener: () => void) => {
    listeners.delete(listener)
  })
  let matches = false

  beforeEach(() => {
    listeners.clear()
    add.mockClear()
    remove.mockClear()
    matches = false
    vi.stubGlobal('matchMedia', () => ({
      get matches() {
        return matches
      },
      addEventListener: add,
      removeEventListener: remove,
    }))
  })

  it('reads the current match and follows change events', () => {
    const { result } = renderHook(() => useMediaQuery(QUERY))
    expect(result.current).toBe(false)
    matches = true
    act(() => {
      listeners.forEach((listener) => {
        listener()
      })
    })
    expect(result.current).toBe(true)
  })
  it('removes its listener on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery(QUERY))
    expect(add).toHaveBeenCalledWith('change', expect.any(Function))
    expect(listeners.size).toBe(1)
    unmount()
    expect(remove).toHaveBeenCalledWith('change', expect.any(Function))
    expect(listeners.size).toBe(0)
  })
})
