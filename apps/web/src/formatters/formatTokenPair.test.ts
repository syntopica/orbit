import { describe, expect, it } from 'vitest'

import { formatTokenPair } from './formatTokenPair'

describe('formatTokenPair', () => {
  it('pairs in and out, dashing an unknown count', () => {
    expect(formatTokenPair(2525, 267)).toBe('2525 → 267')
    expect(formatTokenPair(null, null)).toBe('— → —')
  })
})
