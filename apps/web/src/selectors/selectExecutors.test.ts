import { describe, expect, it } from 'vitest'

import { selectExecutors } from './selectExecutors'

describe('selectExecutors', () => {
  it('joins attempts and judged by provider and model, with weighted score', () => {
    const rows = selectExecutors(
      {
        now: 0,
        ratings: [],
        attempts: [
          {
            queue: 'q.a',
            tier: 'fast',
            provider: 'agy',
            model: 'm',
            attempts: 10,
            succeeded: 8,
            schemaViolations: 0,
            failed: 2,
            preempted: 0,
            meanWallMs: null,
          },
          {
            queue: 'q.b',
            tier: 'fast',
            provider: 'agy',
            model: 'm',
            attempts: 10,
            succeeded: 9,
            schemaViolations: 0,
            failed: 1,
            preempted: 0,
            meanWallMs: null,
          },
        ],
        judged: [
          {
            queue: 'q.a',
            provider: 'agy',
            model: 'm',
            judged: 10,
            meanScore: 0.8,
            best: 1,
          },
          {
            queue: 'q.b',
            provider: 'agy',
            model: 'm',
            judged: 20,
            meanScore: 0.5,
            best: 2,
          },
        ],
      },
      [{ runner: 'agy', availableAt: 100 }],
    )
    expect(rows).toEqual([
      {
        provider: 'agy',
        model: 'm',
        queues: ['q.a', 'q.b'],
        attempts: 20,
        succeeded: 17,
        judged: 30,
        meanScore: 0.6,
        lowSample: true,
        availableAt: 100,
      },
    ])
  })
})
