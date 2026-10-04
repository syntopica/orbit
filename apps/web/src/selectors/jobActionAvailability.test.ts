import { workerJobDetailSchema } from '@orbit/contract'
import { describe, expect, it } from 'vitest'

import { jobActionAvailability } from './jobActionAvailability'

const job = workerJobDetailSchema.parse({
  id: 'job-1',
  queue: 'queue.a',
  producer: 'app',
  state: 'queued',
  privacy: 'internal',
  tier: 'fast',
  createdAt: 1000,
  updatedAt: 1000,
  attempts: 0,
  lastError: null,
  acked: null,
  retryOf: null,
  sampling: false,
  attemptDetails: [],
  hasInput: true,
  hasOutput: false,
})

describe('jobActionAvailability', () => {
  it('only offers actions supported by the current state and stored input', () => {
    expect(jobActionAvailability(job)).toEqual({
      cancelable: true,
      retryable: false,
      ackable: false,
    })
    expect(jobActionAvailability({ ...job, state: 'failed' })).toEqual({
      cancelable: false,
      retryable: true,
      ackable: true,
    })
    expect(
      jobActionAvailability({
        ...job,
        state: 'failed',
        hasInput: false,
        acked: 1000,
      }),
    ).toEqual({ cancelable: false, retryable: false, ackable: false })
    expect(
      jobActionAvailability({ ...job, state: 'needs_reconciliation' }),
    ).toEqual({ cancelable: true, retryable: false, ackable: true })
  })
})
