import { describe, expect, it } from 'vitest'
import { validateSystemSearch } from './validateSystemSearch'

describe('validateSystemSearch', () => {
  it('keeps a known range and defaults the rest', () => {
    expect(validateSystemSearch({ range: '7d' })).toEqual({ range: '7d' })
    expect(validateSystemSearch({ range: '30d' })).toEqual({ range: '30d' })
    expect(validateSystemSearch({ range: '24h' })).toEqual({ range: '24h' })
    expect(validateSystemSearch({ range: '1y' })).toEqual({ range: '24h' })
    expect(validateSystemSearch({})).toEqual({ range: '24h' })
  })
})
