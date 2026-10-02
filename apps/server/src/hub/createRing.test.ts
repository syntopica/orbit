import type { StreamMessage } from '@orbit/contract'

import { createRing } from './createRing'

const sync = (id: number): StreamMessage => ({ type: 'sync', id })

describe('createRing', () => {
  it('replays messages after a known id', () => {
    const ring = createRing(3)
    ;[1, 2, 3].forEach((id) => {
      ring.push(sync(id))
    })
    expect(ring.after(1)?.map((m) => m.id)).toEqual([2, 3])
    expect(ring.after(3)).toEqual([])
    expect(ring.after(0)?.map((m) => m.id)).toEqual([1, 2, 3])
  })
  it('returns null outside the ring', () => {
    const ring = createRing(2)
    ;[1, 2, 3].forEach((id) => {
      ring.push(sync(id))
    })
    expect(ring.after(0)).toBeNull()
    expect(ring.after(9)).toBeNull()
    expect(ring.after(4)).toBeNull()
    expect(ring.after(Number.NaN)).toBeNull()
    expect(ring.after(2.5)).toBeNull()
    expect(createRing(2).after(1)).toBeNull()
  })
  it('keeps exactly capacity messages and accepts the id just before the oldest', () => {
    const ring = createRing(2)
    ;[1, 2, 3].forEach((id) => {
      ring.push(sync(id))
    })
    expect(ring.after(1)?.map((m) => m.id)).toEqual([2, 3])
  })
})
