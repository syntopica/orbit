import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useChartWidth } from './useChartWidth'

const boxOf = (width: number) => {
  const node = document.createElement('div')
  Object.defineProperty(node, 'clientWidth', {
    configurable: true,
    get: () => width,
  })
  return {
    node,
    resize: (next: number) => {
      width = next
    },
  }
}

describe('useChartWidth', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reads the box on mount and follows every resize at once', () => {
    let notify: () => void = () => {
      throw new Error('not observed')
    }
    const disconnect = vi.fn()
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(onResize: () => void) {
          notify = onResize
        }
        observe() {}
        disconnect = disconnect
      },
    )
    const { result, unmount } = renderHook(() => useChartWidth())
    expect(result.current.width).toBe(640)
    const box = boxOf(900)
    act(() => {
      result.current.parentRef(box.node)
    })
    expect(result.current.width).toBe(900)
    box.resize(420)
    act(() => {
      notify()
    })
    expect(result.current.width).toBe(420)
    box.resize(0)
    act(() => {
      notify()
    })
    expect(result.current.width).toBe(420)
    unmount()
    expect(disconnect).toHaveBeenCalled()
  })

  it('keeps the first read when the browser has no ResizeObserver', () => {
    vi.stubGlobal('ResizeObserver', undefined)
    const { result } = renderHook(() => useChartWidth())
    act(() => {
      result.current.parentRef(boxOf(0).node)
    })
    expect(result.current.width).toBe(640)
    act(() => {
      result.current.parentRef(null)
    })
    expect(result.current.width).toBe(640)
  })
})
