import { getEventListeners } from 'node:events'

import { createSlotQueue } from './createSlotQueue'

describe('createSlotQueue', () => {
  it('drops the abort listener once a waiter starts', async () => {
    const queue = createSlotQueue(1)
    await queue.acquire(new AbortController().signal)
    const { signal } = new AbortController()
    const waiting = queue.acquire(signal)
    expect(getEventListeners(signal, 'abort')).toHaveLength(1)
    queue.release()
    await waiting
    expect(getEventListeners(signal, 'abort')).toHaveLength(0)
  })
  it('refuses a request past the waiting cap and counts only live waiters', async () => {
    const queue = createSlotQueue(1, 2)
    await queue.acquire(new AbortController().signal)
    const gone = new AbortController()
    const first = queue.acquire(gone.signal)
    void queue.acquire(new AbortController().signal)
    await expect(
      queue.acquire(new AbortController().signal),
    ).rejects.toMatchObject({ reason: 'lagging' })
    gone.abort()
    await expect(first).rejects.toMatchObject({ reason: 'timeout' })
    const third = queue.acquire(new AbortController().signal)
    queue.release()
    queue.release()
    await expect(third).resolves.toBeUndefined()
  })
})
