import { describe, expect, it } from 'vitest'

import { selectCostColumns } from './selectCostColumns'

describe('selectCostColumns', () => {
  it('fills the range and stacks cost by provider, including free attempts', () => {
    const day = Date.parse('2026-10-02T00:00:00Z')
    const columns = selectCostColumns(
      {
        now: day + 1,
        rows: [
          {
            day,
            queue: 'q',
            provider: 'agy',
            attempts: 2,
            succeeded: 1,
            tokensIn: 10,
            tokensOut: 5,
            wallMs: 100,
            costUsd: 0,
          },
          {
            day,
            queue: 'q',
            provider: 'openrouter',
            attempts: 1,
            succeeded: 1,
            tokensIn: 1,
            tokensOut: 1,
            wallMs: 50,
            costUsd: 0.25,
          },
        ],
      },
      '7d',
    )
    expect(columns).toHaveLength(7)
    expect(columns.at(-1)).toMatchObject({
      total: 0.25,
      attempts: 3,
      segments: [{ key: 'openrouter', count: 0.25 }],
    })
  })
  it('includes both UTC days touched by a 24-hour window', () => {
    const now = Date.parse('2026-10-02T12:00:00Z')
    const yesterday = Date.parse('2026-10-01T00:00:00Z')
    const columns = selectCostColumns(
      {
        now,
        rows: [
          {
            day: yesterday,
            provider: 'agy',
            queue: 'q',
            attempts: 1,
            succeeded: 1,
            tokensIn: 0,
            tokensOut: 0,
            wallMs: 0,
            costUsd: 0.1,
          },
        ],
      },
      '24h',
    )
    expect(columns.map((column) => column.start)).toEqual([
      yesterday,
      yesterday + 86_400_000,
    ])
    expect(columns[0]?.total).toBe(0.1)
  })
})
