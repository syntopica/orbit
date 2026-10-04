import { pollerViewSchema } from './pollerViewSchema'

const row = {
  component: 'brain',
  running: false,
  lastAttemptAt: 1000,
  lastSuccessAt: 900,
  lastDurationMs: 420,
  failures: 1,
  nextAt: 61_000,
}

describe('pollerViewSchema', () => {
  it('accepts a row and a row that never ran', () => {
    const never = {
      ...row,
      lastAttemptAt: null,
      lastSuccessAt: null,
      lastDurationMs: null,
      nextAt: null,
      failures: 0,
    }
    expect(
      pollerViewSchema.parse({ now: 1, rows: [row, never] }).rows,
    ).toHaveLength(2)
  })
  it('refuses an unknown component and a negative failure count', () => {
    expect(() =>
      pollerViewSchema.parse({ now: 1, rows: [{ ...row, component: 'nope' }] }),
    ).toThrow()
    expect(() =>
      pollerViewSchema.parse({ now: 1, rows: [{ ...row, failures: -1 }] }),
    ).toThrow()
  })
})
