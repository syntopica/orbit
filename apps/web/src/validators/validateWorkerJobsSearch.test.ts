import { describe, expect, it } from 'vitest'

import { validateWorkerJobsSearch } from './validateWorkerJobsSearch'

describe('validateWorkerJobsSearch', () => {
  it('keeps valid filters and rejects free text or unbounded cursors', () => {
    expect(
      validateWorkerJobsSearch({
        queue: 'queue.a',
        state: 'failed',
        producer: 'app',
        before: 'cursor',
      }),
    ).toEqual({
      queue: 'queue.a',
      state: 'failed',
      producer: 'app',
      before: 'cursor',
    })
    expect(
      validateWorkerJobsSearch({
        queue: 'bad queue',
        state: 1,
        producer: '',
        before: 'x'.repeat(513),
      }),
    ).toEqual({})
  })
})
