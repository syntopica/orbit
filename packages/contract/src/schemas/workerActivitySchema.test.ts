import { workerActivitySchema } from './workerActivitySchema'

const row = {
  bucket: 1_790_002_800_000,
  queue: 'queue.a',
  provider: 'provider-a',
  sampling: false,
  outcome: 'failed',
  error: 'timeout',
  attempts: 2,
  wallMs: 1500,
  tokensIn: 10,
  tokensOut: 5,
}
const view = {
  now: 1_790_086_400_000,
  since: 1_790_000_000_000,
  bucketMs: 3_600_000,
  rows: [row],
}

describe('workerActivitySchema', () => {
  it('accepts an aggregate view', () => {
    expect(workerActivitySchema.parse(view)).toEqual(view)
  })
  it('rejects free text in an identifier and a fractional count', () => {
    for (const bad of [
      { ...row, queue: 'a b' },
      { ...row, error: 'line\nbreak' },
      { ...row, attempts: 1.5 },
    ]) {
      expect(() =>
        workerActivitySchema.parse({ ...view, rows: [bad] }),
      ).toThrow()
    }
  })
  it('rejects a zero bucket width', () => {
    expect(() => workerActivitySchema.parse({ ...view, bucketMs: 0 })).toThrow()
  })
})
