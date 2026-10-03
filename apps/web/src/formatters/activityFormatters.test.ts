import { describe, expect, it } from 'vitest'

import { formatActivitySummary } from './formatActivitySummary'
import { formatAxisTime } from './formatAxisTime'
import { formatBucketRange } from './formatBucketRange'
import { formatCounts } from './formatCounts'
import { formatFailureSummary } from './formatFailureSummary'
import { formatHourMinute } from './formatHourMinute'

const HOUR = 3_600_000
const START = 1_790_002_800_000

describe('activity formatters', () => {
  it('names a bucket as a local range', () => {
    expect(formatBucketRange(START, START + HOUR)).toMatch(
      /^[A-Z][a-z]{2} \d{2}:\d{2}–\d{2}:\d{2}$/,
    )
    expect(formatHourMinute(START)).toMatch(/^\d{2}:\d{2}$/)
    expect(formatAxisTime(START, HOUR)).toMatch(/^\d{2}:\d{2}$/)
    expect(formatAxisTime(START, 6 * HOUR)).toMatch(/^[A-Z][a-z]{2}$/)
  })
  it('lists counts with thousands separators, or none', () => {
    expect(
      formatCounts([
        { key: 'a', count: 1200 },
        { key: 'b', count: 3 },
      ]),
    ).toBe('a 1,200 · b 3')
    expect(formatCounts([])).toBe('none')
  })
  it('summarises a bucket for the slider value text', () => {
    const column = {
      start: START,
      end: START + HOUR,
      segments: [{ key: 'timeout', count: 2 }],
      total: 2,
    }
    expect(formatFailureSummary(column)).toMatch(/: 2 failures, timeout 2$/)
    expect(formatFailureSummary({ ...column, segments: [], total: 0 })).toMatch(
      /: 0 failures$/,
    )
    expect(
      formatActivitySummary({
        ...column,
        failed: 1,
        sampling: 4,
        meanWallMs: null,
        errors: [],
      }),
    ).toMatch(/: 2 attempts, 1 failed, 4 sampling$/)
  })
})
