import { describe, expect, it } from 'vitest'

import { orbitLeaderGeometry } from './orbitLeaderGeometry'

describe('orbitLeaderGeometry', () => {
  it('joins the nearest label edge to the satellite surface', () => {
    expect(
      orbitLeaderGeometry(
        { x: 100, y: 100, radius: 20, width: 60, height: 30 },
        { x: 150, y: 80, width: 60, height: 30 },
      ),
    ).toEqual({ x1: 150, y1: 100, x2: 120, y2: 100 })
  })

  it('clamps to the closest corner for a diagonal label', () => {
    const line = orbitLeaderGeometry(
      { x: 100, y: 100, radius: 10, width: 60, height: 30 },
      { x: 130, y: 140, width: 60, height: 30 },
    )
    expect([line.x1, line.y1]).toEqual([130, 140])
    expect(Math.hypot(line.x2 - 100, line.y2 - 100)).toBeCloseTo(10)
  })
})
