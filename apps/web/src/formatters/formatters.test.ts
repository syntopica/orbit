import { describe, expect, it } from 'vitest'

import { formatAge } from './formatAge'
import { formatClock } from './formatClock'
import { formatDuration } from './formatDuration'
import { formatMetric } from './formatMetric'
import { formatReadingAge } from './formatReadingAge'

describe('formatters', () => {
  it.each([
    [0, '0s'],
    [-5_000, '0s'],
    [59_999, '59s'],
    [60_000, '1m'],
    [45_000, '45s'],
    [12 * 60_000, '12m'],
    [3_599_000, '59m'],
    [3_600_000, '1h'],
    [3 * 3_600_000, '3h'],
    [47 * 3_600_000, '47h'],
    [48 * 3_600_000, '2d'],
    [50 * 3_600_000, '2d'],
  ])('formatDuration(%i) is %s', (ms, text) => {
    expect(formatDuration(ms)).toBe(text)
  })
  it('formats an age and never a negative one', () => {
    const now = Date.parse('2026-10-02T10:05:00.000Z')
    expect(formatAge('2026-10-02T10:00:00.000Z', now)).toBe('5m')
    expect(formatAge('2026-10-02T10:06:00.000Z', now)).toBe('0s')
  })
  it('words the age of a last reading', () => {
    const now = Date.parse('2026-10-02T10:05:00.000Z')
    expect(formatReadingAge('2026-10-02T10:00:00.000Z', now)).toBe(
      'last reading 5m',
    )
  })
  it('formats metrics by key', () => {
    expect(formatMetric('worker.queued', 1234)).toBe('1,234')
    expect(formatMetric('worker.queued', 1.26)).toBe('1.3')
    expect(formatMetric('worker.wasted_1h_s', 600)).toBe('10m')
  })
  it('formats a clock time', () => {
    expect(formatClock('2026-10-02T10:00:07.000Z')).toMatch(/^\d{2}:\d{2}:07$/)
  })
})
