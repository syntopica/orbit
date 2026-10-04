import { describe, expect, it } from 'vitest'

import { workerCostsSchema } from './workerCostsSchema'

describe('workerCostsSchema', () => {
  it('accepts a complete aggregate including zero cost', () => {
    expect(
      workerCostsSchema.parse({
        now: 1,
        rows: [
          {
            day: 0,
            provider: 'agy',
            queue: 'queue.a',
            attempts: 2,
            succeeded: 1,
            wallMs: 1000,
            tokensIn: 3,
            tokensOut: 4,
            costUsd: 0,
          },
        ],
      }).rows[0]?.costUsd,
    ).toBe(0)
  })
  it('rejects invalid identifiers and negative counts', () => {
    const row = {
      day: 0,
      provider: 'bad name',
      queue: 'q',
      attempts: -1,
      succeeded: 0,
      wallMs: 0,
      tokensIn: 0,
      tokensOut: 0,
      costUsd: 0,
    }
    expect(workerCostsSchema.safeParse({ now: 1, rows: [row] }).success).toBe(
      false,
    )
  })
})
