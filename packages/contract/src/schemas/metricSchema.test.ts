import { metricSchema } from './metricSchema'

describe('metricSchema', () => {
  it('accepts a known key with a number', () => {
    const m = { key: 'worker.queued', value: 3, at: '2026-10-02T10:00:00.000Z' }
    expect(metricSchema.parse(m)).toEqual(m)
  })
  it('rejects an unknown key', () => {
    expect(() =>
      metricSchema.parse({
        key: 'x',
        value: 1,
        at: '2026-10-02T10:00:00.000Z',
      }),
    ).toThrow()
  })
  it('rejects a non-finite value', () => {
    expect(() =>
      metricSchema.parse({
        key: 'worker.queued',
        value: Infinity,
        at: '2026-10-02T10:00:00.000Z',
      }),
    ).toThrow()
  })
})
