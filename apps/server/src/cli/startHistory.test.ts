import type { Snapshot } from '@orbit/contract'

import { createHub } from '../hub/createHub'
import { openHistoryDb } from '../test/openHistoryDb'
import { startHistory } from './startHistory'

const DAY = 86_400_000
const snapshot = (value: number): Snapshot => ({
  component: 'synthetic',
  health: { state: 'ok', reason: null },
  metrics: [{ key: 'synthetic.value', value, at: '2026-10-02T10:00:00.000Z' }],
  pending: [],
  events: [],
  observedAt: '2026-10-02T10:00:00.000Z',
  lastGood: null,
})

const count = (db: ReturnType<typeof openHistoryDb>, table: string): number =>
  (db.prepare(`SELECT count(*) AS n FROM ${table}`).get() as { n: number }).n

describe('startHistory', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })
    vi.setSystemTime(new Date('2026-10-02T10:00:00.000Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('records metrics from published snapshots until stopped', () => {
    const db = openHistoryDb()
    const hub = createHub({ ringSize: 10, recentEvents: 5, firstId: 1 })
    const stop = startHistory(db, hub)
    hub.publish(snapshot(3))
    expect(count(db, 'metric_samples')).toBe(1)
    stop()
    hub.publish(snapshot(4))
    expect(count(db, 'metric_samples')).toBe(1)
  })

  it('touches the run every minute and once more on stop', () => {
    const db = openHistoryDb()
    const hub = createHub({ ringSize: 10, recentEvents: 5, firstId: 1 })
    const started = Date.now()
    const stop = startHistory(db, hub)
    const stopped = (): number =>
      (
        db
          .prepare('SELECT stopped FROM runs WHERE started = ?')
          .get(started) as {
          stopped: number
        }
      ).stopped
    expect(stopped()).toBe(started)
    vi.advanceTimersByTime(60_000)
    expect(stopped()).toBe(started + 60_000)
    vi.advanceTimersByTime(30_000)
    stop()
    expect(stopped()).toBe(started + 90_000)
    vi.advanceTimersByTime(600_000)
    expect(stopped()).toBe(started + 90_000)
  })

  it('prunes at start and every hour, and no longer once stopped', () => {
    const db = openHistoryDb()
    const hub = createHub({ ringSize: 10, recentEvents: 5, firstId: 1 })
    const insert = db.prepare(
      'INSERT INTO metric_samples (component, key, value, at) VALUES (?, ?, ?, ?)',
    )
    insert.run('synthetic', 'old', 1, Date.now() - 30 * DAY)
    const stop = startHistory(db, hub)
    expect(count(db, 'metric_samples')).toBe(0)
    insert.run('synthetic', 'old', 1, Date.now() - 30 * DAY)
    vi.advanceTimersByTime(3_600_000)
    expect(count(db, 'metric_samples')).toBe(0)
    stop()
    insert.run('synthetic', 'old', 1, Date.now() - 30 * DAY)
    vi.advanceTimersByTime(3_600_000)
    expect(count(db, 'metric_samples')).toBe(1)
  })
})
