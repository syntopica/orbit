import { describe, expect, it } from 'vitest'

import { formatAttemptTokens } from './formatAttemptTokens'

describe('formatAttemptTokens', () => {
  it('shows both counts', () => {
    expect(formatAttemptTokens(2, 3)).toBe('2 in · 3 out')
  })

  it('shows a dash while an attempt is running', () => {
    expect(formatAttemptTokens(null, null)).toBe('— in · — out')
  })
})
