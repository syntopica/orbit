import { describe, expect, it } from 'vitest'

import { workerCostsReportSchema } from './workerCostsReportSchema'
import { workerQualityReportSchema } from './workerQualityReportSchema'

describe('worker aggregate reports', () => {
  it('requires a real UTC day and nonnegative cost', () => {
    const row = {
      day: '2026-10-01',
      provider: 'agy',
      queue: 'q',
      attempts: 1,
      succeeded: 1,
      tokens_in: 0,
      tokens_out: 0,
      cost_usd: 0,
      wall_s: 0,
    }
    expect(workerCostsReportSchema.safeParse({ rows: [row] }).success).toBe(
      true,
    )
    expect(
      workerCostsReportSchema.safeParse({
        rows: [{ ...row, day: '2026-02-30' }],
      }).success,
    ).toBe(false)
    expect(
      workerCostsReportSchema.safeParse({ rows: [{ ...row, cost_usd: -1 }] })
        .success,
    ).toBe(false)
  })
  it('requires all quality aggregate lists', () => {
    expect(
      workerQualityReportSchema.safeParse({
        attempts: [],
        ratings: [],
        judged: [],
      }).success,
    ).toBe(true)
    expect(
      workerQualityReportSchema.safeParse({ attempts: [], judged: [] }).success,
    ).toBe(false)
  })
})
