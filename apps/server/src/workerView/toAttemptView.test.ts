import { describe, expect, it } from 'vitest'

import { workerAttemptReportSchema } from '../adapters/worker/workerAttemptReportSchema'
import { toAttemptView } from './toAttemptView'

// An older worker's attempt: no wall time or cost fields.
const running = workerAttemptReportSchema.parse({
  node: 'node-a',
  provider: null,
  model: null,
  outcome: null,
  error: null,
  started: 1_700_000_000,
  ended: null,
  tokens_in: null,
  tokens_out: null,
})

describe('toAttemptView', () => {
  it('keeps an attempt still running, with no tokens yet', () => {
    expect(toAttemptView(running)).toEqual({
      node: 'node-a',
      provider: null,
      model: null,
      outcome: null,
      error: null,
      startedAt: 1_700_000_000_000,
      endedAt: null,
      tokensIn: null,
      tokensOut: null,
      wallMs: null,
      costUsd: null,
    })
  })

  it('carries wall time in milliseconds and cost, blanking a bad cost', () => {
    const settled = { ...running, ended: 1_700_000_002, wall_s: 1.5 }
    expect(toAttemptView({ ...settled, cost_usd: 0.25 })).toMatchObject({
      wallMs: 1500,
      costUsd: 0.25,
    })
    expect(toAttemptView({ ...settled, cost_usd: -1 })?.costUsd).toBeNull()
  })

  it('drops an attempt whose provider is not an identifier', () => {
    expect(toAttemptView({ ...running, provider: 'bad name' })).toBeNull()
  })
})
