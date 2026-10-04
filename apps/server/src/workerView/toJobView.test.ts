import { toAttemptView } from './toAttemptView'
import { toJobView } from './toJobView'

const row = {
  id: 'job-1',
  queue: 'queue.a',
  producer: 'app',
  state: 'failed',
  privacy: 'internal' as const,
  tier: 'fast',
  created: 1.5,
  updated: 2,
  attempts: 1,
  last_error: 'timeout',
  acked: 3.5,
  retry_of: 'job-0',
  sampling: false,
}

describe('job identifier mapping', () => {
  it('drops rows with invalid primary identifiers and blanks secondary codes', () => {
    for (const key of ['id', 'queue', 'producer', 'state', 'tier'] as const)
      expect(toJobView({ ...row, [key]: 'bad value' })).toBeNull()
    expect(
      toJobView({ ...row, last_error: 'free text', retry_of: 'free text' }),
    ).toMatchObject({
      lastError: null,
      retryOf: null,
      createdAt: 1500,
      acked: 3500,
    })
  })
  it('drops attempts with invalid primary fields and blanks error codes', () => {
    const attempt = {
      node: 'node-a',
      provider: 'agy',
      model: 'model-a',
      outcome: 'failed',
      error: 'free text',
      started: 1.25,
      ended: 2,
      tokens_in: 2,
      tokens_out: 3,
    }
    expect(toAttemptView(attempt)).toMatchObject({
      error: null,
      startedAt: 1250,
      endedAt: 2000,
    })
    for (const key of ['node', 'provider', 'model', 'outcome'] as const)
      expect(toAttemptView({ ...attempt, [key]: 'bad value' })).toBeNull()
  })
})
