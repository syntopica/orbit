import type { Snapshot, SnapshotCore } from '@orbit/contract'

import type { Adapter } from '../types/Adapter'
import { createScheduler } from './createScheduler'

const ok = (component: 'worker' | 'launchd'): SnapshotCore => ({
  component,
  health: { state: 'ok', reason: null },
  metrics: [],
  pending: [],
  events: [],
  observedAt: new Date().toISOString(),
})

describe('createScheduler', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('keeps a healthy adapter on schedule while another hangs', async () => {
    const hung: Adapter = {
      id: 'launchd',
      cadenceMs: 1000,
      timeoutMs: 60_000,
      freshnessMs: 120_000,
      read: async () => new Promise<SnapshotCore>(() => undefined),
    }
    const healthy: Adapter = {
      id: 'worker',
      cadenceMs: 1000,
      timeoutMs: 3000,
      freshnessMs: 10_000,
      read: async () => {
        await Promise.resolve()
        return ok('worker')
      },
    }
    const times: number[] = []
    const scheduler = createScheduler([hung, healthy], {
      publish: (s: Snapshot) => {
        if (s.component === 'worker') times.push(Date.now())
      },
    })
    const start = Date.now()
    scheduler.start()
    await vi.advanceTimersByTimeAsync(5050)
    scheduler.stop()
    const offsets = times.map((t) => t - start)
    expect(offsets).toEqual([0, 1000, 2000, 3000, 4000, 5000])
  })
})
