import { describe, expect, it } from 'vitest'

import { formatAttemptSpan } from './formatAttemptSpan'

describe('formatAttemptSpan', () => {
  const start = new Date(2026, 9, 4, 10, 0, 0).getTime()
  it('labels a finished attempt with both ends and its length', () => {
    expect(formatAttemptSpan(start, start + 95_000)).toBe(
      '10:00:00 to 10:01:35 (1m)',
    )
  })
  it('labels a running attempt with its start only', () => {
    expect(formatAttemptSpan(start, null)).toBe(
      'started 10:00:00, still running',
    )
  })
})
