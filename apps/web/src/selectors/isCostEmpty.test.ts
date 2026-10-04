import { describe, expect, it } from 'vitest'

import { isCostEmpty } from './isCostEmpty'

const column = (total: number) => ({
  start: 0,
  end: 1,
  segments: [],
  total,
  attempts: 1,
})

describe('isCostEmpty', () => {
  it('is empty only when no day in the range has spend', () => {
    expect(isCostEmpty([column(0), column(0)])).toBe(true)
    expect(isCostEmpty([])).toBe(true)
    expect(isCostEmpty([column(0), column(0.25)])).toBe(false)
  })
})
