import { describe, expect, it } from 'vitest'

import { requestLayout } from './requestLayout'

// A worker that answers with whatever `reply` returns, or fails.
const fakeWorker = (reply: (request: unknown) => unknown, fail = false) => {
  const listeners = new Map<string, (event: { data?: unknown }) => void>()
  const worker = {
    terminated: false,
    addEventListener: (
      type: string,
      listener: (event: { data?: unknown }) => void,
    ) => {
      listeners.set(type, listener)
    },
    postMessage: (request: unknown) => {
      queueMicrotask(() => {
        if (fail) listeners.get('error')?.({})
        else listeners.get('message')?.({ data: reply(request) })
      })
    },
    terminate: () => {
      worker.terminated = true
    },
  }
  return worker
}
const request = { order: 2, edges: [], seed: 1 }

describe('requestLayout', () => {
  it('posts the request, validates the answer and terminates the worker', async () => {
    const worker = fakeWorker(() => ({
      x: [0, 1],
      y: [1, 0],
      community: [0, 1],
    }))
    const layout = await requestLayout(
      () => worker as unknown as Worker,
      request,
    )
    expect(layout).toEqual({ x: [0, 1], y: [1, 0], community: [0, 1] })
    expect(worker.terminated).toBe(true)
  })
  it('rejects a malformed or short answer and a worker error', async () => {
    const short = fakeWorker(() => ({ x: [0], y: [0], community: [0] }))
    await expect(
      requestLayout(() => short as unknown as Worker, request),
    ).rejects.toThrow('layout_invalid')
    const broken = fakeWorker(() => null, true)
    await expect(
      requestLayout(() => broken as unknown as Worker, request),
    ).rejects.toThrow('layout_failed')
    expect(broken.terminated).toBe(true)
  })
})
