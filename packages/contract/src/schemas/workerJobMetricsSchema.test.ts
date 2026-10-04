import { workerJobDetailSchema } from './workerJobDetailSchema'
import { workerJobSchema } from './workerJobSchema'
import { workerResultSchema } from './workerResultSchema'

const job = {
  id: 'job-1',
  queue: 'queue.a',
  producer: 'app',
  state: 'running',
  privacy: 'internal',
  tier: 'basic',
  createdAt: 1000,
  updatedAt: 2000,
  attempts: 1,
  lastError: null,
  acked: null,
  retryOf: null,
  sampling: false,
}

const result = {
  resultId: 'result-1',
  control: null,
  error: null,
  schemaPath: null,
  node: 'node-a',
  provider: 'ollama',
  model: 'model-a',
  tokensIn: 4,
  tokensOut: 2,
  costUsd: 0,
  rating: 'good',
  createdAt: 3000,
  ackedAt: null,
}

describe('worker job metrics contracts', () => {
  it('reads a row from an older sender with every metric null', () => {
    const row = workerJobSchema.parse(job)
    expect(row.kind).toBeNull()
    expect(row.tokensIn).toBeNull()
    expect(row.costUsd).toBeNull()
    expect(row.lastModel).toBeNull()
  })
  it('keeps metrics bounded: identifiers and non-negative numbers', () => {
    const full = {
      ...job,
      kind: 'inference',
      model: 'vendor/model:free',
      leaseNode: 'node-a',
      tokensIn: 12,
      tokensOut: 3,
      costUsd: 0.25,
      wallMs: 4500,
      lastStartedAt: 1500,
    }
    expect(workerJobSchema.parse(full)).toMatchObject(full)
    for (const bad of [
      { kind: 'free text' },
      { tokensIn: -1 },
      { tokensOut: 1.5 },
      { costUsd: -0.1 },
    ])
      expect(workerJobSchema.safeParse({ ...job, ...bad }).success).toBe(false)
  })
  it('defaults result metadata to none and validates each result', () => {
    const detail = {
      ...job,
      attemptDetails: [],
      hasInput: true,
      hasOutput: false,
    }
    expect(workerJobDetailSchema.parse(detail).results).toEqual([])
    expect(
      workerJobDetailSchema.parse({ ...detail, results: [result] }).results,
    ).toEqual([result])
    expect(
      workerResultSchema.safeParse({ ...result, rating: 'not an id' }).success,
    ).toBe(false)
    expect(
      workerResultSchema.parse({ ...result, output: 'text' }),
    ).not.toHaveProperty('output')
  })
})
