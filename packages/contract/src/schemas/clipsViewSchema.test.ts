import { clipsViewSchema } from './clipsViewSchema'

const view = {
  now: 1_790_000_000_000,
  total: 4,
  states: [{ state: 'pending', count: 4, oldestAt: 1_789_000_000_000 }],
  intake: { days: [{ day: '2026-10-02', count: 2 }], undated: 0 },
  doctor: { ok: true, checks: [{ name: 'paths', ok: true, code: 'ok' }] },
  capture: null,
  items: null,
}

describe('clipsViewSchema', () => {
  it('accepts a view', () => {
    expect(clipsViewSchema.parse(view)).toEqual(view)
  })
  it('rejects an intake day that is not a date and a free-text code', () => {
    const days = [{ day: 'yesterday', count: 1 }]
    expect(() =>
      clipsViewSchema.parse({ ...view, intake: { days, undated: 0 } }),
    ).toThrow()
    const checks = [{ name: 'paths', ok: false, code: 'see the log' }]
    expect(() =>
      clipsViewSchema.parse({ ...view, doctor: { ok: false, checks } }),
    ).toThrow()
  })
})
