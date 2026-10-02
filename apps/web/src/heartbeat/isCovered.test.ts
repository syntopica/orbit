import { describe, expect, it } from 'vitest'
import { isCovered } from './isCovered'

const H = 3_600_000

describe('isCovered', () => {
  it('needs the whole window inside merged run intervals', () => {
    const runs = [
      { started: 0, stopped: H },
      { started: H + 30_000, stopped: 3 * H },
    ]
    expect(isCovered(runs, 0, 2 * H)).toBe(true)
    expect(isCovered(runs, 2 * H, 4 * H)).toBe(false)
    expect(isCovered([], 0, 1)).toBe(false)
  })
  it('allows exactly 90 s of slack after a stop', () => {
    const runs = [{ started: 0, stopped: H }]
    expect(isCovered(runs, 0, H + 90_000)).toBe(true)
    expect(isCovered(runs, 0, H + 90_001)).toBe(false)
  })
  it('bridges a gap up to the slack and no further', () => {
    const bridged = [
      { started: 0, stopped: 1_000 },
      { started: 91_000, stopped: 200_000 },
    ]
    const broken = [
      { started: 0, stopped: 1_000 },
      { started: 91_001, stopped: 200_000 },
    ]
    expect(isCovered(bridged, 0, 200_000)).toBe(true)
    expect(isCovered(broken, 0, 200_000)).toBe(false)
  })
  it('needs the window to start inside a run', () => {
    expect(isCovered([{ started: 1, stopped: H }], 0, 10)).toBe(false)
    expect(isCovered([{ started: 0, stopped: H }], 0, 10)).toBe(true)
  })
  it('does not depend on the order of the runs', () => {
    const runs = [
      { started: 100_000, stopped: 200_000 },
      { started: 0, stopped: 100_000 },
    ]
    expect(isCovered(runs, 0, 200_000)).toBe(true)
  })
  it('stops at the first run that reaches the end of the window', () => {
    const runs = [
      { started: 0, stopped: H },
      { started: 5 * H, stopped: 6 * H },
    ]
    expect(isCovered(runs, 0, H)).toBe(true)
  })
})
