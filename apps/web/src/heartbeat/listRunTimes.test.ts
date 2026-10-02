import { describe, expect, it } from 'vitest'
import { observation as obs } from '../test/launchdObservation'
import { listRunTimes } from './listRunTimes'

describe('listRunTimes', () => {
  it('keeps the times where the run counter went up', () => {
    const series = [
      obs(1, 1, 0),
      obs(2, 2, 0),
      obs(3, 2, 78),
      obs(4, 0, 0),
      obs(5, 1, 0),
    ]
    expect(listRunTimes(series)).toEqual([2, 5])
  })
  it('ignores readings without a counter', () => {
    expect(
      listRunTimes([obs(1, null, null), obs(2, 3, 0), obs(3, null, 0)]),
    ).toEqual([])
  })
  it('counts a jump of more than one run once', () => {
    expect(listRunTimes([obs(1, 1, 0), obs(2, 9, 0)])).toEqual([2])
  })
})
