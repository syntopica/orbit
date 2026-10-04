import { describe, expect, it } from 'vitest'

import { jobStateTone } from '../selectors/jobStateTone'
import { formatJobCount } from './formatJobCount'
import { shortenId } from './shortenId'

describe('job list formatters', () => {
  it('shortens long ids to eight characters and an ellipsis', () => {
    expect(shortenId('0123456789abcdef0123456789abcdef')).toBe('01234567…')
    expect(shortenId('job-1')).toBe('job-1')
    expect(shortenId('123456789')).toBe('123456789')
  })

  it('counts jobs and says when older pages exist', () => {
    expect(formatJobCount(1, false)).toBe('1 job, newest first')
    expect(formatJobCount(50, true)).toBe(
      '50 jobs, newest first; older jobs on the next page',
    )
  })

  it('maps job states to status tones', () => {
    expect(jobStateTone('succeeded')).toBe('ok')
    expect(jobStateTone('failed')).toBe('down')
    expect(jobStateTone('running')).toBe('warn')
    expect(jobStateTone('queued')).toBe('unknown')
  })
})
