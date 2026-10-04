import { describe, expect, it } from 'vitest'

import { defaultGroupOpen } from './defaultGroupOpen'

describe('defaultGroupOpen', () => {
  it('collapses groups over ten items unless a search or source filter is on', () => {
    expect(defaultGroupOpen(10, {})).toBe(true)
    expect(defaultGroupOpen(11, {})).toBe(false)
    expect(defaultGroupOpen(11, { q: 'needle' })).toBe(true)
    expect(defaultGroupOpen(11, { source: 'todo:a' })).toBe(true)
    expect(defaultGroupOpen(11, { state: 'open' })).toBe(false)
  })
})
