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
})
