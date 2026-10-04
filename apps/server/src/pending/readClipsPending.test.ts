import type { Snapshot } from '@orbit/contract'

import { readClipsPending } from './readClipsPending'

const snapshot: Snapshot = {
  component: 'clips',
  health: { state: 'ok', reason: null },
  metrics: [],
  events: [],
  observedAt: '2026-10-04T00:00:00.000Z',
  lastGood: null,
  pending: [
    { key: 'clips.pending', count: 3, oldestAt: '2026-10-03T00:00:00.000Z' },
    { key: 'clips.needs_claude', count: 1, oldestAt: null },
  ],
}

describe('readClipsPending', () => {
  it('turns snapshot counts into aggregate rows with ages', () => {
    const result = readClipsPending(
      snapshot,
      Date.parse('2026-10-04T00:00:00.000Z'),
    )
    expect(result.source.count).toBe(4)
    expect(result.items).toMatchObject([{ ageMs: 86_400_000 }, { ageMs: null }])
  })
  it('reports unavailable when the snapshot is absent or down', () => {
    expect(() => readClipsPending(undefined, 1)).toThrow()
    expect(() =>
      readClipsPending(
        { ...snapshot, health: { state: 'down', reason: 'unreachable' } },
        1,
      ),
    ).toThrow()
    expect(readClipsPending({ ...snapshot, pending: [] }, 1).items).toEqual([])
  })
})
