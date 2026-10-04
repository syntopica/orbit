import { workerJobActionSchema } from './workerJobActionSchema'
import { workerJobContentSchema } from './workerJobContentSchema'
import { workerJobDetailSchema } from './workerJobDetailSchema'
import { workerJobListSchema } from './workerJobListSchema'
import { workerJobSchema } from './workerJobSchema'

const job = {
  id: 'job-1',
  queue: 'queue.a',
  producer: 'app',
  state: 'failed',
  privacy: 'secret',
  tier: 'fast',
  createdAt: 1000,
  updatedAt: 2000,
  attempts: 1,
  lastError: 'timeout',
  acked: null,
  retryOf: null,
  sampling: false,
}

describe('worker job contracts', () => {
  it('keeps bounded identifiers and epoch milliseconds on list rows', () => {
    expect(workerJobSchema.parse(job)).toEqual(job)
    expect(workerJobSchema.safeParse({ ...job, id: 'free text' }).success).toBe(
      false,
    )
    expect(
      workerJobListSchema.parse({ jobs: [job], next: null }).jobs,
    ).toHaveLength(1)
    expect(
      workerJobListSchema.safeParse({ jobs: [job], next: 1 }).success,
    ).toBe(false)
  })
  it('validates detail attempts and payload flags', () => {
    const detail = {
      ...job,
      attemptDetails: [
        {
          node: 'node-a',
          provider: 'agy',
          model: 'model-a',
          outcome: 'failed',
          error: null,
          startedAt: 1000,
          endedAt: 2000,
          tokensIn: 2,
          tokensOut: 3,
        },
      ],
      hasInput: true,
      hasOutput: false,
    }
    expect(workerJobDetailSchema.parse(detail)).toEqual(detail)
    expect(
      workerJobDetailSchema.safeParse({
        ...detail,
        attemptDetails: [
          { ...detail.attemptDetails[0], provider: 'bad provider' },
        ],
      }).success,
    ).toBe(false)
  })
  it('allows opaque content only in the content contract', () => {
    const content = { input: { prompt: 'private text' }, output: null }
    expect(workerJobContentSchema.parse(content)).toEqual(content)
    expect(
      workerJobSchema.parse({ ...job, input: content.input }),
    ).not.toHaveProperty('input')
    expect(
      workerJobActionSchema.parse({
        id: 'job-2',
        state: 'queued',
        retryOf: 'job-1',
      }),
    ).toEqual({ id: 'job-2', state: 'queued', retryOf: 'job-1' })
  })
})
