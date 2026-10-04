import { describe, expect, it } from 'vitest'

import { isStateList } from './isStateList'
import { workerJobListPath } from './workerJobListPath'

describe('isStateList', () => {
  it('accepts one state or a comma-separated list of identifiers', () => {
    expect(isStateList('running')).toBe(true)
    expect(isStateList('leased,running,draining')).toBe(true)
    expect(isStateList('running,')).toBe(false)
    expect(isStateList('running,free text')).toBe(false)
    expect(
      isStateList(Array.from({ length: 14 }, () => 'queued').join(',')),
    ).toBe(false)
  })
  it('passes a running-now filter through to the worker, encoded', () => {
    expect(
      workerJobListPath({ state: 'leased,running,draining', limit: '100' }),
    ).toEqual({
      path: '/v1/admin/jobs?state=leased%2Crunning%2Cdraining&limit=100',
    })
    expect(workerJobListPath({ queue: 'a,b' })).toEqual({
      error: 'bad_request',
    })
  })
})
