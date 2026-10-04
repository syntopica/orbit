import { describe, expect, it } from 'vitest'

import { formatCheckedAt } from './formatCheckedAt'

describe('formatCheckedAt', () => {
  it('names the local clock time of the read', () => {
    const at = new Date(2026, 9, 4, 14, 5, 9).getTime()
    expect(formatCheckedAt(at)).toBe('Checked at 14:05:09.')
  })
})
