import { describe, expect, it } from 'vitest'

import { snapshotOf } from '../test/snapshotOf'
import { selectPending } from './selectPending'

const OK = 'ok'
const WORKER = 'worker'
const FAILED = 'worker.failed_jobs'

describe('selectPending', () => {
  it('drops empty items and sorts oldest first, unknown age last', () => {
    const worker = snapshotOf(WORKER, OK, {
      pending: [
        {
          key: FAILED,
          count: 4,
          oldestAt: '2026-10-02T09:00:00.000Z',
        },
        { key: 'worker.queued_jobs', count: 0, oldestAt: null },
      ],
    })
    const launchd = snapshotOf('launchd', 'warn', {
      pending: [
        {
          key: 'launchd.failing_jobs',
          count: 1,
          oldestAt: '2026-10-01T09:00:00.000Z',
        },
      ],
    })
    const synthetic = snapshotOf('synthetic', OK, {
      pending: [{ key: 'synthetic.items', count: 2, oldestAt: null }],
    })
    const rows = selectPending({ worker, launchd, synthetic })
    expect(rows.map((row) => row.key)).toEqual([
      'launchd.failing_jobs',
      FAILED,
      'synthetic.items',
    ])
    expect(rows.every((row) => !row.stale)).toBe(true)
  })
  it('keeps the last known items of a down component, marked stale', () => {
    const { lastGood: _ignored, ...core } = snapshotOf(WORKER, OK, {
      pending: [{ key: FAILED, count: 4, oldestAt: null }],
    })
    const rows = selectPending({
      worker: snapshotOf(WORKER, 'down', { lastGood: core }),
    })
    expect(rows).toMatchObject([{ key: FAILED, count: 4, stale: true }])
  })
  it('uses the own items of a down component with no last good reading', () => {
    const rows = selectPending({
      worker: snapshotOf(WORKER, 'down', {
        pending: [{ key: FAILED, count: 4, oldestAt: null }],
      }),
    })
    expect(rows).toMatchObject([{ count: 4, stale: false }])
  })
  it('ignores last good items of a component that is not down', () => {
    const { lastGood: _ignored, ...core } = snapshotOf(WORKER, OK, {
      pending: [{ key: FAILED, count: 9, oldestAt: null }],
    })
    const rows = selectPending({
      worker: snapshotOf(WORKER, 'warn', {
        pending: [{ key: FAILED, count: 1, oldestAt: null }],
        lastGood: core,
      }),
    })
    expect(rows).toMatchObject([{ count: 1, stale: false }])
  })
})
