import { identifierSchema } from './identifierSchema'
import { workerViewSchema } from './workerViewSchema'

const view = {
  now: 1_790_000_000_000,
  queues: [
    {
      name: 'queue.a',
      queued: 2,
      live: 0,
      failed: 1,
      succeeded: 3,
      oldestQueuedMs: 60_000,
      done1h: 0,
    },
  ],
  nodes: [
    {
      name: 'node-a',
      reason: null,
      idleMs: 1000,
      onAc: true,
      pressure: 'normal',
      resident: ['model-a:7b'],
      reportAgeMs: 5000,
      lastRelease: { code: 'user_active', ageMs: 10_000 },
    },
  ],
  cooldowns: [{ runner: 'runner-a:model-a', availableAt: 1_790_000_060_000 }],
  failures: [
    { id: 'a'.repeat(32), queue: 'queue.a', error: null, finishedAt: null },
  ],
}

describe('workerViewSchema', () => {
  it('accepts a full view', () => {
    expect(workerViewSchema.parse(view)).toEqual(view)
  })
  it('rejects more than 50 failures', () => {
    const failures = Array.from({ length: 51 }, () => view.failures[0])
    expect(() => workerViewSchema.parse({ ...view, failures })).toThrow()
  })
})

describe('identifierSchema', () => {
  it.each(['queue.a', 'runner-a:model/b', 'x@1+2', 'a'.repeat(128)])(
    'accepts %s',
    (value) => {
      expect(identifierSchema.safeParse(value).success).toBe(true)
    },
  )
  it.each(['', 'a b', 'a'.repeat(129), 'line\nbreak', 'é'])(
    'rejects %j',
    (value) => {
      expect(identifierSchema.safeParse(value).success).toBe(false)
    },
  )
})
