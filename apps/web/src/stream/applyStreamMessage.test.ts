import type { Snapshot, StreamMessage } from '@orbit/contract'
import { describe, expect, it } from 'vitest'

import { applyStreamMessage } from './applyStreamMessage'
import { INITIAL_STREAM_STATE } from './initialStreamState'

const snapshot: Snapshot = {
  component: 'worker',
  health: { state: 'ok', reason: null },
  metrics: [],
  pending: [],
  events: [],
  observedAt: '2026-10-02T10:00:00.000Z',
  lastGood: null,
}
const event = (n: number): StreamMessage => ({
  type: 'event',
  id: n,
  event: {
    at: '2026-10-02T10:00:00.000Z',
    component: 'worker',
    kind: 'worker.job_failed',
    severity: 'error',
    refs: { n },
  },
})

describe('applyStreamMessage', () => {
  it('stores snapshots by component and marks sync', () => {
    let state = applyStreamMessage(INITIAL_STREAM_STATE, {
      type: 'snapshot',
      id: 5,
      snapshot,
    })
    state = applyStreamMessage(state, { type: 'sync', id: 5 })
    expect(state.snapshots.worker).toEqual(snapshot)
    expect(state).toMatchObject({ lastId: 5, synced: true })
  })
  it('keeps the newest 50 events first', () => {
    let state = INITIAL_STREAM_STATE
    for (let n = 1; n <= 60; n += 1) state = applyStreamMessage(state, event(n))
    expect(state.events).toHaveLength(50)
    expect(state.events[0]?.refs).toEqual({ n: 60 })
  })
  it('forgets everything on resync', () => {
    let state = applyStreamMessage(INITIAL_STREAM_STATE, {
      type: 'snapshot',
      id: 1,
      snapshot,
    })
    state = applyStreamMessage(state, event(2))
    state = applyStreamMessage(state, { type: 'resync', id: 9 })
    expect(state).toEqual({
      snapshots: {},
      events: [],
      lastId: 9,
      synced: false,
    })
  })
})
