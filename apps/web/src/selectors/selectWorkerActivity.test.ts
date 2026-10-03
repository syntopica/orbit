import { describe, expect, it } from 'vitest'

import {
  ACTIVITY_NOW,
  activityRow,
  HOUR,
  LAST_BUCKET,
  workerActivity,
} from '../test/workerActivity'
import { bucketIndex } from './bucketIndex'
import { bucketStarts } from './bucketStarts'
import { foldTopCounts } from './foldTopCounts'
import { selectWorkerActivity } from './selectWorkerActivity'

const view = workerActivity([
  activityRow({ attempts: 4, wallMs: 4000 }),
  activityRow({ provider: 'ollama', attempts: 2, wallMs: 6000 }),
  activityRow({ provider: 'mystery', outcome: 'preempted', error: 'busy' }),
  activityRow({ outcome: 'failed', error: 'timeout', attempts: 3 }),
  activityRow({ outcome: 'failed', error: null, queue: 'queue.b' }),
  activityRow({ sampling: true, attempts: 7, provider: 'openrouter' }),
  activityRow({ bucket: LAST_BUCKET - HOUR, provider: 'openrouter' }),
  activityRow({ bucket: LAST_BUCKET - 40 * HOUR, attempts: 99 }),
])

describe('bucket axis', () => {
  it('runs from the bucket holding since to the one holding now', () => {
    const starts = bucketStarts(workerActivity())
    expect(starts).toHaveLength(25)
    expect(starts.at(-1)).toBe(LAST_BUCKET)
    expect(starts[0]).toBe(LAST_BUCKET - 24 * HOUR)
  })
  it('places rows by bucket and refuses rows off the axis', () => {
    const starts = bucketStarts(workerActivity())
    expect(bucketIndex(starts, HOUR, LAST_BUCKET)).toBe(24)
    expect(bucketIndex(starts, HOUR, LAST_BUCKET + HOUR)).toBe(-1)
    expect(bucketIndex(starts, HOUR, (starts[0] ?? 0) - 1)).toBe(-1)
    expect(bucketIndex([], HOUR, LAST_BUCKET)).toBe(-1)
  })
})

describe('foldTopCounts', () => {
  it('keeps the largest and folds the rest into other', () => {
    const counts = new Map([
      ['b', 2],
      ['a', 2],
      ['c', 5],
      ['d', 1],
      ['zero', 0],
    ])
    expect(foldTopCounts(counts, 2)).toEqual([
      { key: 'c', count: 5 },
      { key: 'a', count: 2 },
      { key: 'other', count: 3 },
    ])
    expect(foldTopCounts(counts, 9)).toHaveLength(4)
  })
})

describe('selectWorkerActivity', () => {
  const model = selectWorkerActivity(view)
  it('stacks production attempts by provider with failures on top', () => {
    const last = model.columns.at(-1)
    expect(last?.segments).toEqual([
      { key: 'agy', count: 4 },
      { key: 'ollama', count: 2 },
      { key: 'other', count: 1 },
      { key: 'failed', count: 4 },
    ])
    expect(last?.total).toBe(11)
    expect(last?.failed).toBe(4)
    expect(last?.sampling).toBe(7)
    expect(last?.errors).toEqual([
      { key: 'timeout', count: 3 },
      { key: 'no code', count: 1 },
    ])
    expect(last?.end).toBe(LAST_BUCKET + HOUR)
    expect(model.columns[0]?.meanWallMs).toBeNull()
    expect(model.series).toEqual([
      'agy',
      'openrouter',
      'ollama',
      'other',
      'failed',
    ])
  })
  it('rolls each queue up without sampling', () => {
    const a = model.queues.get('queue.a')
    expect(a?.succeeded.at(-1)).toBe(6)
    expect(a?.succeeded.at(-2)).toBe(1)
    expect(a?.outcomes).toEqual([
      { key: 'succeeded', count: 7 },
      { key: 'failed', count: 3 },
      { key: 'preempted', count: 1 },
    ])
    expect(a?.providers[0]).toEqual({ key: 'agy', count: 7 })
    expect(a?.errors).toEqual([{ key: 'timeout', count: 3 }])
    expect(a?.tokensIn).toBe(50)
    expect(model.queues.get('queue.b')?.errors).toEqual([
      { key: 'no code', count: 1 },
    ])
  })
  it('charts failures by fixed codes in fixed order and folds the rest', () => {
    const codes = ['c1', 'quota_wall', 'no_output', 'c2']
    const many = selectWorkerActivity(
      workerActivity(
        codes.map((error, i) =>
          activityRow({ outcome: 'failed', error, attempts: 10 - i }),
        ),
      ),
    )
    expect(many.failures.keys).toEqual(['no_output', 'quota_wall', 'other'])
    expect(many.failures.columns.at(-1)?.segments.at(-1)).toEqual({
      key: 'other',
      count: 17,
    })
    expect(many.failures.columns.at(-1)?.total).toBe(34)
    expect(many.failures.columns[0]?.total).toBe(0)
  })
  it('counts every OpenRouter attempt since 00:00 UTC', () => {
    expect(model.openrouter.count).toBe(8)
    const dayStart = Math.floor(ACTIVITY_NOW / 86_400_000) * 86_400_000
    expect(model.openrouter.starts[0]).toBe(dayStart)
    expect(model.openrouter.values.at(-1)).toBe(7)
  })
})
