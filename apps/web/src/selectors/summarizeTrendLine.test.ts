import { describe, expect, it } from 'vitest'

import { summarizeTrendLine } from './summarizeTrendLine'

describe('summarizeTrendLine', () => {
  it('compares the newest reading with the first, skipping gaps', () => {
    expect(summarizeTrendLine([null, 5, null, 8, null])).toEqual({
      latest: 8,
      change: 3,
    })
  })
  it('has no summary without a reading', () => {
    expect(summarizeTrendLine([null, null])).toBeNull()
  })
})
