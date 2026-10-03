import { describe, expect, it } from 'vitest'

import { freshnessState } from './freshnessState'

describe('freshnessState', () => {
  it.each([
    [null, 'unknown'],
    [10_000, 'ok'],
    [8_999, 'warn'],
    [8_000, 'warn'],
    [7_999, 'down'],
  ] as const)('reads %s', (at, expected) => {
    expect(freshnessState(at, 1000, 10_000)).toBe(expected)
  })
})
