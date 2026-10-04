import { pendingViewSchema } from './pendingViewSchema'

describe('pendingViewSchema', () => {
  it('accepts a bounded detail board', () => {
    expect(
      pendingViewSchema.safeParse({ now: 1, sources: [], items: [] }).success,
    ).toBe(true)
    expect(
      pendingViewSchema.safeParse({
        now: 1,
        sources: [],
        items: Array(2001).fill({}),
      }).success,
    ).toBe(false)
  })
})
