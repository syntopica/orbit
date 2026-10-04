import { describe, expect, it } from 'vitest'

import { toCostsView } from './toCostsView'
import { toQualityView } from './toQualityView'

describe('worker aggregate mapping', () => {
  it('keeps zero cost, converts time and drops invalid cost identifiers', () => {
    const row = {
      day: '2026-10-01',
      provider: 'agy',
      queue: 'q',
      attempts: 1,
      succeeded: 1,
      tokens_in: 2,
      tokens_out: 1,
      cost_usd: 0,
      wall_s: 0.5,
    }
    expect(
      toCostsView({ rows: [row, { ...row, queue: 'bad queue' }] }, 5),
    ).toEqual({
      now: 5,
      rows: [
        {
          day: Date.parse('2026-10-01T00:00:00Z'),
          provider: 'agy',
          queue: 'q',
          attempts: 1,
          succeeded: 1,
          tokensIn: 2,
          tokensOut: 1,
          costUsd: 0,
          wallMs: 500,
        },
      ],
    })
  })
  it('drops invalid primary names and blanks invalid tier codes', () => {
    const attempt = {
      queue: 'q',
      tier: 'bad tier',
      provider: 'agy',
      model: 'm',
      attempts: 2,
      succeeded: 1,
      schema_violations: 1,
      failed: 1,
      preempted: 0,
      mean_wall_s: null,
    }
    const rating = {
      queue: 'q',
      tier: 'fast',
      provider: 'agy',
      model: 'm',
      results: 2,
      rated: 1,
      good: 1,
      edited: 0,
      discarded: 0,
    }
    const judged = {
      queue: 'q',
      provider: 'agy',
      model: 'm',
      judged: 2,
      mean_score: null,
      best: 1,
    }
    expect(
      toQualityView(
        {
          attempts: [attempt, { ...attempt, model: 'bad model' }],
          ratings: [rating, { ...rating, provider: 'bad provider' }],
          judged: [judged, { ...judged, queue: 'bad queue' }],
        },
        5,
      ),
    ).toEqual({
      now: 5,
      attempts: [
        {
          queue: 'q',
          tier: null,
          provider: 'agy',
          model: 'm',
          attempts: 2,
          succeeded: 1,
          schemaViolations: 1,
          failed: 1,
          preempted: 0,
          meanWallMs: null,
        },
      ],
      ratings: [
        {
          queue: 'q',
          tier: 'fast',
          provider: 'agy',
          model: 'm',
          results: 2,
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
          judged: 2,
          meanScore: null,
          best: 1,
        },
      ],
    })
  })
})
