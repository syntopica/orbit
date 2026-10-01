import { backoffDelay } from './backoffDelay'

describe('backoffDelay', () => {
  it('doubles per failure and caps at ten cadences', () => {
    expect(backoffDelay(1000, 1)).toBe(2000)
    expect(backoffDelay(1000, 3)).toBe(8000)
    expect(backoffDelay(1000, 9)).toBe(10_000)
  })
})
