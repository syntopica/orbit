import { pendingSchema } from './pendingSchema'

describe('pendingSchema', () => {
  it('accepts a known key with a count', () => {
    const p = { key: 'worker.failed_jobs', count: 2, oldestAt: null }
    expect(pendingSchema.parse(p)).toEqual(p)
  })
  it('rejects a negative count', () => {
    expect(() =>
      pendingSchema.parse({
        key: 'worker.failed_jobs',
        count: -1,
        oldestAt: null,
      }),
    ).toThrow()
  })
})
