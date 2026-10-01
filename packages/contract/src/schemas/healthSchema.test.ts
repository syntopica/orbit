import { healthSchema } from './healthSchema'

describe('healthSchema', () => {
  it('accepts ok without a reason', () => {
    expect(healthSchema.parse({ state: 'ok', reason: null })).toEqual({
      state: 'ok',
      reason: null,
    })
  })
  it('accepts down with a closed reason', () => {
    expect(
      healthSchema.parse({ state: 'down', reason: 'timeout' }).reason,
    ).toBe('timeout')
  })
  it('rejects a free-text reason', () => {
    expect(() =>
      healthSchema.parse({ state: 'down', reason: 'disk on fire' }),
    ).toThrow()
  })
})
