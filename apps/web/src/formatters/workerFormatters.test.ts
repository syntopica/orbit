import type { OrbitEvent } from '@orbit/contract'
import { describe, expect, it } from 'vitest'

import { formatBlocker } from './formatBlocker'
import { formatEventRefs } from './formatEventRefs'
import { formatLocalTime } from './formatLocalTime'
import { formatPower } from './formatPower'
import { formatSpan } from './formatSpan'

const event = (refs: OrbitEvent['refs']): OrbitEvent => ({
  at: '2026-10-02T10:00:00.000Z',
  component: 'worker',
  kind: 'worker.job_failed',
  severity: 'warn',
  refs,
})

describe('worker formatters', () => {
  it.each([
    [0, '0s'],
    [-1, '0s'],
    [999, '0s'],
    [40_000, '40s'],
    [12 * 60_000, '12m'],
    [12 * 60_000 + 5_000, '12m 5s'],
    [3 * 3_600_000, '3h'],
    [3 * 3_600_000 + 5 * 60_000 + 9_000, '3h 5m'],
    [4 * 86_400_000 + 10 * 3_600_000 + 1_000, '4d 10h'],
    [4 * 86_400_000 + 5 * 60_000, '4d'],
    [710_401_770, '8d 5h'],
  ])('formatSpan(%i) is %s', (ms, text) => {
    expect(formatSpan(ms)).toBe(text)
  })
  it('words blockers with and without a duration', () => {
    const blocker = { subject: 'x', code: null }
    expect(formatBlocker({ ...blocker, kind: 'cooldown', ms: 3_600_000 })).toBe(
      'available in 1h',
    )
    expect(formatBlocker({ ...blocker, kind: 'stale', ms: 36_000_000 })).toBe(
      'last reported 10h ago',
    )
    expect(formatBlocker({ ...blocker, kind: 'in_use', ms: null })).toBe(
      'is in use, works when idle',
    )
  })
  it('formats refs in a fixed order with a short job id', () => {
    expect(
      formatEventRefs(event({ job: '0123456789abcdef', queue: 'queue.a' })),
    ).toBe('queue.a · job 01234567')
    expect(formatEventRefs(event({ exit: 78, label: 'com.example.job' }))).toBe(
      'com.example.job · exit 78',
    )
    expect(formatEventRefs(event({ runner: 'runner-a' }))).toBe('runner-a')
    expect(formatEventRefs(event({ reason: 'timeout' }))).toBe('Read timed out')
    expect(formatEventRefs(event({ reason: 'novel_code' }))).toBe('novel_code')
    expect(formatEventRefs(event({ other: 'x' }))).toBe('')
  })
  it('formats power and a local time', () => {
    expect([formatPower(true), formatPower(false), formatPower(null)]).toEqual([
      'mains',
      'battery',
      'unknown',
    ])
    expect(formatLocalTime(Date.UTC(2026, 9, 2, 10, 7))).toMatch(
      /^\w{3},? \d{2}:07$/,
    )
  })
})
