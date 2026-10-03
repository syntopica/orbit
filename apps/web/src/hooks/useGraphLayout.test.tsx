import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { buildGraphModel } from '../selectors/buildGraphModel'
import { useGraphLayout } from './useGraphLayout'

vi.mock('../layout/createLayoutWorker', async () => {
  const { fakeLayoutWorkerModule } =
    await import('../test/fakeLayoutWorkerModule')
  return fakeLayoutWorkerModule
})

const model = buildGraphModel({
  now: 0,
  nodes: [
    { id: 'notes/a', type: 'topic', degree: 1, orphan: false },
    { id: 'notes/b', type: 'topic', degree: 1, orphan: false },
  ],
  edges: [[0, 1]],
  dangling: 0,
  skipped: 0,
})

describe('useGraphLayout', () => {
  it('waits for a model, then answers its layout', async () => {
    const { result, rerender } = renderHook(
      ({ current }) => useGraphLayout(current),
      { initialProps: { current: null as typeof model | null } },
    )
    expect(result.current).toEqual({ layout: null, failed: false })
    rerender({ current: model })
    await waitFor(() => {
      expect(result.current.layout?.x).toHaveLength(2)
    })
    expect(result.current.failed).toBe(false)
  })
})
