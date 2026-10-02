import type { Snapshot } from '@orbit/contract'

import { openHistoryDb } from '../test/openHistoryDb'
import { recordMetrics } from './recordMetrics'

const startIso = '2026-10-02T10:00:00.000Z'
const snap = (
  value: number,
  at: string,
  component: Snapshot['component'] = 'worker',
  key: Snapshot['metrics'][number]['key'] = 'worker.queued',
): Snapshot => ({
  component,
  health: { state: 'ok', reason: null },
  metrics: [{ key, value, at }],
  pending: [],
  events: [],
  observedAt: at,
  lastGood: null,
})

describe('recordMetrics', () => {
  it('stores a sample only when the value changes', () => {
    const db = openHistoryDb()
    recordMetrics(db, snap(1, startIso))
    recordMetrics(db, snap(1, '2026-10-02T10:00:05.000Z'))
    recordMetrics(db, snap(2, '2026-10-02T10:00:10.000Z'))
    const rows = db
      .prepare('SELECT value, at FROM metric_samples ORDER BY at')
      .all() as { value: number }[]
    expect(rows.map((r) => r.value)).toEqual([1, 2])
  })

  it('stores the metric timestamp as epoch milliseconds', () => {
    const db = openHistoryDb()
    recordMetrics(db, snap(1, startIso))
    expect(db.prepare('SELECT at FROM metric_samples').get()).toEqual({
      at: Date.parse(startIso),
    })
  })

  it('records a return to an earlier value as a change', () => {
    const db = openHistoryDb()
    recordMetrics(db, snap(1, startIso))
    recordMetrics(db, snap(2, '2026-10-02T10:00:05.000Z'))
    recordMetrics(db, snap(1, '2026-10-02T10:00:10.000Z'))
    expect(
      db.prepare('SELECT count(*) AS n FROM metric_samples').get(),
    ).toEqual({
      n: 3,
    })
  })

  it('compares per component and key independently', () => {
    const db = openHistoryDb()
    recordMetrics(db, snap(1, startIso))
    recordMetrics(db, snap(1, '2026-10-02T10:00:01.000Z', 'brain'))
    recordMetrics(
      db,
      snap(1, '2026-10-02T10:00:02.000Z', 'worker', 'worker.failed'),
    )
    expect(
      db.prepare('SELECT count(*) AS n FROM metric_samples').get(),
    ).toEqual({
      n: 3,
    })
  })

  it('compares against the last inserted sample when timestamps tie', () => {
    const db = openHistoryDb()
    recordMetrics(db, snap(1, startIso))
    recordMetrics(db, snap(2, startIso))
    recordMetrics(db, snap(2, startIso))
    expect(db.prepare('SELECT value FROM metric_samples').all()).toEqual([
      { value: 1 },
      { value: 2 },
    ])
  })
})
