import { describe, expect, it } from 'vitest'

import { selectDailyCostRows } from './selectDailyCostRows'

describe('selectDailyCostRows', () => {
  it('adds queues for the same provider and retains zero-cost providers', () => {
    const row = {
      day: 1,
      provider: 'agy',
      queue: 'q.a',
      attempts: 1,
      succeeded: 1,
      tokensIn: 2,
      tokensOut: 1,
      wallMs: 50,
      costUsd: 0,
    }
    expect(
      selectDailyCostRows([
        row,
        { ...row, queue: 'q.b' },
        { ...row, provider: 'openrouter', costUsd: 0.25 },
      ]),
    ).toEqual([
      { day: 1, provider: 'agy', costUsd: 0 },
      { day: 1, provider: 'openrouter', costUsd: 0.25 },
    ])
  })
})
