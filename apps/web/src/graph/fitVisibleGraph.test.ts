import { describe, expect, it } from 'vitest'

import { fitVisibleGraph } from './fitVisibleGraph'

describe('fitVisibleGraph', () => {
  it('centres and fits only visible nodes with viewport padding', () => {
    const points = [
      { x: 100, y: 200 },
      { x: 300, y: 400 },
    ]
    expect(fitVisibleGraph(points, { width: 800, height: 600 })).toEqual({
      center: { x: 200, y: 300 },
      ratio: 200 / 480,
    })
  })
  it('fits a wide neighbourhood and keeps an isolated node at finite zoom', () => {
    expect(
      fitVisibleGraph(
        [
          { x: 0, y: 0 },
          { x: 800, y: 10 },
        ],
        { width: 800, height: 600 },
      )?.ratio,
    ).toBe(1.25)
    expect(
      fitVisibleGraph([{ x: 20, y: 30 }], { width: 800, height: 600 }),
    ).toEqual({ center: { x: 20, y: 30 }, ratio: 0.1 })
  })
  it('does not move the camera for an empty graph or unmeasured viewport', () => {
    expect(fitVisibleGraph([], { width: 800, height: 600 })).toBeNull()
    expect(
      fitVisibleGraph([{ x: 0, y: 0 }], { width: 0, height: 600 }),
    ).toBeNull()
    expect(
      fitVisibleGraph([{ x: 0, y: 0 }], { width: 800, height: 0 }),
    ).toBeNull()
  })
})
