import { describe, expect, it } from 'vitest'
import { observation as obs } from '../test/launchdObservation'
import { missWindowFor } from './missWindowFor'

const H = 3_600_000
const end = 10 * H
const runs = [{ started: 0, stopped: end }]

describe('missWindowFor', () => {
  it('has no window for a job without an interval', () => {
    expect(missWindowFor({ observations: [], runs }, [], null, end)).toBeNull()
  })
  it('watches 1.5 intervals, with a baseline exactly at the window start', () => {
    const start = end - 1.5 * H
    const at = (t: number) => ({ observations: [obs(t, 1, 0)], runs })
    expect(missWindowFor(at(start), [], H, end)?.watched).toBe(true)
    expect(missWindowFor(at(start + 1), [], H, end)?.watched).toBe(false)
  })
  it('needs a baseline reading with a counter', () => {
    const history = { observations: [obs(0, null, null)], runs }
    expect(missWindowFor(history, [], H, end)?.watched).toBe(false)
  })
  it('needs the window to be covered', () => {
    const history = {
      observations: [obs(0, 1, 0)],
      runs: [{ started: 0, stopped: end - 2 * H }],
    }
    expect(missWindowFor(history, [], H, end)?.watched).toBe(false)
  })
  it('needs the first half interval of the window covered too', () => {
    const start = end - 1.5 * H
    const history = {
      observations: [obs(0, 1, 0)],
      runs: [
        { started: 0, stopped: start - 90_000 },
        { started: end - H, stopped: end },
      ],
    }
    expect(missWindowFor(history, [], H, end)?.watched).toBe(false)
  })
  it('counts a run inside [start, end) and nothing outside', () => {
    const start = end - 1.5 * H
    const history = { observations: [obs(0, 1, 0)], runs }
    expect(missWindowFor(history, [start - 1], H, end)?.ran).toBe(false)
    expect(missWindowFor(history, [start], H, end)?.ran).toBe(true)
    expect(missWindowFor(history, [end - 1], H, end)?.ran).toBe(true)
    expect(missWindowFor(history, [end], H, end)?.ran).toBe(false)
  })
})
