import type { Snapshot } from '@orbit/contract'

import type { ClipsDocuments } from '../types/ClipsDocuments'
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
const item = {
  id: '0123456789abcdef',
  state: 'needs-claude',
  reason: 'routed_needs_claude',
  failure: { stage: 'synthesis', code: 'MODEL_ESCALATED' },
  stage: 'operator',
  capturedAt: '2026-10-02T00:00:00.000Z',
  lastTransitionAt: '2026-10-03T00:00:00.000Z',
  attempts: 2,
  lastRun: {
    startedAt: '2026-10-03T00:00:00.000Z',
    durationMs: 93_000,
    outcome: 'escalated',
    model: 'worker:ollama/model-a',
    boundary: 'worker-inference',
    workerJobIds: ['job-1', 'job-2'],
    usage: null,
  },
  pages: [],
}
const latest = (items: unknown[] | undefined): ClipsDocuments => ({
  status: {
    schemaVersion: 1,
    total: 2,
    states: {},
    oldestAt: {},
    intake: { days: [], undated: 0 },
    ...(items === undefined ? {} : { items }),
  },
  doctor: { schemaVersion: 1, ok: true, checks: [] },
})
const now = Date.parse('2026-10-04T00:00:00.000Z')

describe('readClipsPending', () => {
  it('turns snapshot counts into aggregate rows with ages', () => {
    const result = readClipsPending(snapshot, null, now)
    expect(result.source.count).toBe(4)
    expect(result.items).toMatchObject([{ ageMs: 86_400_000 }, { ageMs: null }])
  })
  it('falls back to aggregates when the engine lists no items', () => {
    expect(
      readClipsPending(snapshot, latest(undefined), now).items,
    ).toHaveLength(2)
  })
  it('lists each waiting clip by its codes, and skips reconciled ones', () => {
    const done = { ...item, id: 'fedcba9876543210', state: 'reconciled' }
    const result = readClipsPending(snapshot, latest([item, done, {}]), now)
    expect(result.source.count).toBe(1)
    expect(result.items).toEqual([
      {
        id: 'clips:0123456789abcdef',
        source: 'clips',
        kind: 'clips',
        state: 'waiting',
        title: 'Clip needs-claude: MODEL_ESCALATED',
        detail: [
          'Stage: operator',
          'Reason: routed_needs_claude',
          'Attempts: 2',
          'Failure: MODEL_ESCALATED at synthesis',
          'Last run: escalated in 93 s by worker:ollama/model-a',
          'Worker jobs: job-1, job-2',
        ].join('\n'),
        section: 'needs-claude',
        ref: '/clips',
        ageMs: 2 * 86_400_000,
      },
    ])
  })
  it('reports unavailable when the snapshot is absent or down', () => {
    expect(() => readClipsPending(undefined, null, 1)).toThrow()
    expect(() =>
      readClipsPending(
        { ...snapshot, health: { state: 'down', reason: 'unreachable' } },
        null,
        1,
      ),
    ).toThrow()
    expect(
      readClipsPending({ ...snapshot, pending: [] }, null, 1).items,
    ).toEqual([])
  })
})
