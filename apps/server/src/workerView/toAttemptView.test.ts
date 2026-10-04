import { describe, expect, it } from 'vitest'

import { toAttemptView } from './toAttemptView'

const running = {
  node: 'node-a',
  provider: null,
  model: null,
  outcome: null,
  error: null,
  started: 1_700_000_000,
  ended: null,
  tokens_in: null,
  tokens_out: null,
}

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
    })
  })

  it('drops an attempt whose provider is not an identifier', () => {
    expect(toAttemptView({ ...running, provider: 'bad name' })).toBeNull()
  })
})
