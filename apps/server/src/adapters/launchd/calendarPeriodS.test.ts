import { calendarPeriodS } from './calendarPeriodS'

describe('calendarPeriodS', () => {
  it.each([
    [{ Minute: 0 }, 3_600],
    [{ Hour: 3, Minute: 0 }, 86_400],
    [{ Weekday: 1, Hour: 9 }, 604_800],
    [{ Day: 1 }, 2_678_400],
    [{ Month: 1, Day: 1 }, 31_622_400],
    [[{ Hour: 3 }, { Minute: 30 }], 3_600],
    [[{ Month: 1 }, { Day: 1 }], 2_678_400],
    [{}, 60],
  ])('%j repeats at most every %i s', (value, period) => {
    expect(calendarPeriodS(value)).toBe(period)
  })
  it('returns null without a calendar', () => {
    expect(calendarPeriodS(undefined)).toBeNull()
  })
  it('returns null for an empty list', () => {
    expect(calendarPeriodS([])).toBeNull()
  })
})
