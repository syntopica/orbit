import { describe, expect, it } from 'vitest'

import { formatTrendChange } from './formatTrendChange'

describe('formatTrendChange', () => {
  it('signs a change and names no change in words', () => {
    expect(formatTrendChange(1200)).toBe('+1,200 in range')
    expect(formatTrendChange(-3)).toBe('−3 in range')
    expect(formatTrendChange(0)).toBe('no change in range')
  })
})
