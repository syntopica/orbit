import type { PollerRow } from '@orbit/contract'
import { describe, expect, it } from 'vitest'

import { describePollerRows } from './describePollerRows'

const base: PollerRow = {
  component: 'brain',
  running: false,
  lastAttemptAt: 90_000,
  lastSuccessAt: 90_400,
  lastDurationMs: 400,
  failures: 0,
  nextAt: 150_400,
}
const describe1 = (row: Partial<PollerRow>, now = 100_000) =>
  describePollerRows({ now, rows: [{ ...base, ...row }] })[0]

describe('describePollerRows', () => {
  it('describes a healthy loop with its last success, duration and next tick', () => {
    expect(describe1({})).toEqual({
      component: 'brain',
      state: 'ok',
      detail: 'last success 9s ago · took 400 ms · next in 50s',
    })
  })
  it('marks a reading, a never-read, a failing and a late loop', () => {
    expect(describe1({ running: true })?.state).toBe('reading')
    expect(describe1({ running: true })?.detail).not.toContain('next in')
    expect(
      describe1({
        lastAttemptAt: null,
        lastSuccessAt: null,
        lastDurationMs: null,
        nextAt: null,
      }),
    ).toMatchObject({ state: 'waiting', detail: 'last success never' })
    expect(describe1({ failures: 3 })).toMatchObject({
      state: 'failing',
      detail: expect.stringContaining('3 failed in a row') as string,
    })
    expect(describe1({}, 150_400 + 30_001)?.state).toBe('overdue')
    expect(describe1({}, 150_400 + 30_000)?.state).toBe('ok')
  })
})
