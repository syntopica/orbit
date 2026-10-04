import { describe, expect, it } from 'vitest'

import { splitUrls } from './splitUrls'

describe('splitUrls', () => {
  it('separates addresses from text and leaves a trailing period out', () => {
    expect(splitUrls('see https://example.com/a?b=1. then')).toEqual([
      { at: 0, text: 'see ', url: false },
      { at: 4, text: 'https://example.com/a?b=1', url: true },
      { at: 29, text: '. then', url: false },
    ])
  })
  it('returns plain text untouched', () => {
    expect(splitUrls('no address')).toEqual([
      { at: 0, text: 'no address', url: false },
    ])
  })
})
