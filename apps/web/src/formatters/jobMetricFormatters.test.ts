import { describe, expect, it } from 'vitest'

import { jobElapsedMs } from '../selectors/jobElapsedMs'
import { formatCostOrDash } from './formatCostOrDash'
import { formatJobContent } from './formatJobContent'
import { formatJobResult } from './formatJobResult'
import { formatWallTime } from './formatWallTime'

describe('job metric formatters', () => {
  it('formats wall time by magnitude and a missing one as a dash', () => {
    expect(formatWallTime(null)).toBe('—')
    expect(formatWallTime(-5)).toBe('0.0s')
    expect(formatWallTime(1234)).toBe('1.2s')
    expect(formatWallTime(59_949)).toBe('59.9s')
    expect(formatWallTime(185_000)).toBe('3m 05s')
    expect(formatWallTime(3_720_000)).toBe('1h 02m')
  })
  it('shows a zero cost and dashes an unknown one', () => {
    expect(formatCostOrDash(0)).toBe('$0.00')
    expect(formatCostOrDash(0.1234)).toBe('$0.1234')
    expect(formatCostOrDash(null)).toBe('—')
  })
  it('names the result by error code first, then outcome', () => {
    expect(
      formatJobResult({ lastError: 'timeout', lastOutcome: 'failed' }),
    ).toBe('timeout')
    expect(formatJobResult({ lastError: null, lastOutcome: 'succeeded' })).toBe(
      'succeeded',
    )
    expect(formatJobResult({ lastError: null, lastOutcome: null })).toBe('—')
  })
  it('prints content as text and says null when it is not stored', () => {
    expect(formatJobContent({ a: 1 })).toBe('{\n  "a": 1\n}')
    expect(formatJobContent('plain')).toBe('plain')
    expect(formatJobContent(null)).toBeNull()
    expect(formatJobContent(undefined)).toBeNull()
  })
  it('measures elapsed time from the attempt start, else the last update', () => {
    expect(jobElapsedMs({ lastStartedAt: 1000, updatedAt: 500 }, 4000)).toBe(
      3000,
    )
    expect(jobElapsedMs({ lastStartedAt: null, updatedAt: 500 }, 4000)).toBe(
      3500,
    )
    expect(jobElapsedMs({ lastStartedAt: 5000, updatedAt: 500 }, 4000)).toBe(0)
  })
})
