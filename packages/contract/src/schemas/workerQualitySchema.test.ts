import { describe, expect, it } from 'vitest'

import { workerQualitySchema } from './workerQualitySchema'

describe('workerQualitySchema', () => {
  it('accepts nullable means and the three aggregate lists', () => {
    expect(
      workerQualitySchema.parse({
        now: 1,
        attempts: [
          {
            queue: 'q',
            tier: null,
            provider: 'agy',
            model: 'm',
            attempts: 2,
            succeeded: 1,
            schemaViolations: 0,
            failed: 1,
            preempted: 0,
            meanWallMs: null,
          },
        ],
        ratings: [
          {
            queue: 'q',
            tier: null,
            provider: 'agy',
            model: 'm',
            results: 1,
            rated: 1,
            good: 1,
            edited: 0,
            discarded: 0,
          },
        ],
        judged: [
          {
            queue: 'q',
            provider: 'agy',
            model: 'm',
            judged: 1,
            meanScore: null,
            best: 1,
          },
        ],
      }).judged[0]?.meanScore,
    ).toBeNull()
  })
})
