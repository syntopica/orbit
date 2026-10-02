import { summarizeWorker } from './summarizeWorker'

const status = {
  queues: {
    'q.a': {
      states: { queued: 3, running: 1, failed: 2 },
      oldest_queued_s: 120,
      done_1h: 5,
      wasted_1h_s: 1.5,
    },
    'q.b': {
      states: { leased: 1, draining: 1 },
      oldest_queued_s: null,
      done_1h: 1,
      wasted_1h_s: 0,
    },
  },
  nodes: { n1: { age_s: 1 }, n2: { age_s: 2 } },
  cooldowns: { runner: 60 },
  recent_failures: [],
}

describe('summarizeWorker', () => {
  it('aggregates queues into closed metrics and pending items', () => {
    const now = new Date('2026-10-02T10:00:00.000Z')
    const summary = summarizeWorker(status, now)
    const value = (key: string) =>
      summary.metrics.find((m) => m.key === key)?.value
    expect(value('worker.queued')).toBe(3)
    expect(value('worker.live')).toBe(3)
    expect(value('worker.failed')).toBe(2)
    expect(value('worker.done_1h')).toBe(6)
    expect(value('worker.wasted_1h_s')).toBe(1.5)
    expect(value('worker.cooldowns')).toBe(1)
    expect(value('worker.nodes')).toBe(2)
    expect(summary.pending).toEqual([
      { key: 'worker.failed_jobs', count: 2, oldestAt: null },
      {
        key: 'worker.queued_jobs',
        count: 3,
        oldestAt: '2026-10-02T09:58:00.000Z',
      },
    ])
    expect(summary.health).toEqual({ state: 'ok', reason: null })
  })
  it('reports no pending items for an empty worker', () => {
    const empty = { queues: {}, nodes: {}, cooldowns: {}, recent_failures: [] }
    const summary = summarizeWorker(empty, new Date('2026-10-02T10:00:00.000Z'))
    expect(summary.pending).toEqual([])
    expect(summary.metrics.every((m) => m.value === 0)).toBe(true)
  })
})
