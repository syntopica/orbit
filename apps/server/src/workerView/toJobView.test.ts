import { workerAttemptReportSchema } from '../adapters/worker/workerAttemptReportSchema'
import { workerJobReportSchema } from '../adapters/worker/workerJobReportSchema'
import { toAttemptView } from './toAttemptView'
import { toJobView } from './toJobView'

const row = workerJobReportSchema.parse({
  id: 'job-1',
  queue: 'queue.a',
  producer: 'app',
  state: 'failed',
  privacy: 'internal',
  tier: 'fast',
  created: 1.5,
  updated: 2,
  attempts: 1,
  last_error: 'timeout',
  acked: 3.5,
  retry_of: 'job-0',
  sampling: false,
})

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
  it('reads an older worker row with every metric null', () => {
    expect(toJobView(row)).toMatchObject({
      kind: null,
      model: null,
      leaseNode: null,
      tokensIn: null,
      costUsd: null,
      wallMs: null,
      lastModel: null,
      lastStartedAt: null,
    })
  })
  it('maps metrics to milliseconds and blanks the ones that fail their rule', () => {
    const metrics = {
      ...row,
      kind: 'inference',
      model: 'vendor/model:free',
      priority: 50,
      finished: 9,
      deadline: 10,
      lease_node: 'node-a',
      lease_expires: 8.25,
      parent_id: 'job-0',
      preemptions: 2,
      tokens_in: 12,
      tokens_out: 3,
      cost_usd: 0.25,
      wall_s: 4.5,
      last_model: 'model-b',
      last_provider: 'openrouter',
      last_started: 7,
      last_outcome: 'succeeded',
    }
    expect(toJobView(metrics)).toMatchObject({
      kind: 'inference',
      model: 'vendor/model:free',
      priority: 50,
      finishedAt: 9000,
      deadlineAt: 10_000,
      leaseNode: 'node-a',
      leaseExpiresAt: 8250,
      parentId: 'job-0',
      preemptions: 2,
      tokensIn: 12,
      tokensOut: 3,
      costUsd: 0.25,
      wallMs: 4500,
      lastModel: 'model-b',
      lastProvider: 'openrouter',
      lastStartedAt: 7000,
      lastOutcome: 'succeeded',
    })
    expect(
      toJobView({
        ...metrics,
        kind: 'free text',
        tokens_in: 1.5,
        priority: -1,
        cost_usd: Number.NaN,
      }),
    ).toMatchObject({
      kind: null,
      tokensIn: null,
      priority: null,
      costUsd: null,
    })
  })
  it('drops attempts with invalid primary fields and blanks error codes', () => {
    const attempt = workerAttemptReportSchema.parse({
      node: 'node-a',
      provider: 'agy',
      model: 'model-a',
      outcome: 'failed',
      error: 'free text',
      started: 1.25,
      ended: 2,
      tokens_in: 2,
      tokens_out: 3,
    })
    expect(toAttemptView(attempt)).toMatchObject({
      error: null,
      startedAt: 1250,
      endedAt: 2000,
    })
    for (const key of ['node', 'provider', 'model', 'outcome'] as const)
      expect(toAttemptView({ ...attempt, [key]: 'bad value' })).toBeNull()
  })
})
