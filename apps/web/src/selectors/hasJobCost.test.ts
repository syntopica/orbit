import { describe, expect, it } from 'vitest'

import { hasJobCost } from './hasJobCost'

describe('hasJobCost', () => {
  it('is false when no job has a cost, true when one does', () => {
    expect(hasJobCost([])).toBe(false)
    expect(hasJobCost([{ costUsd: null }, { costUsd: null }])).toBe(false)
    expect(hasJobCost([{ costUsd: null }, { costUsd: 0 }])).toBe(true)
  })
})
