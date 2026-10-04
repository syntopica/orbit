import { describe, expect, it } from 'vitest'

import { nearestDistances3d } from './nearestDistances3d'
import { normalizeBodies3d } from './normalizeBodies3d'

const body = (x: number, y: number, z: number) => ({
  x,
  y,
  z,
  dx: 0,
  dy: 0,
  dz: 0,
})

describe('normalizeBodies3d', () => {
  it('puts a single body at the origin', () => {
    expect(normalizeBodies3d([body(5, 5, 5)], 2)).toEqual([[0, 0, 0]])
    expect(nearestDistances3d([[1, 2, 3]])).toEqual([])
  })
  it('spaces neighbours and draws a far outlier in', () => {
    const points = normalizeBodies3d(
      [body(0, 0, 0), body(1, 0, 0), body(2, 0, 0), body(100, 0, 0)],
      2,
    )
    expect(Math.abs((points[1]?.[0] ?? 0) - (points[0]?.[0] ?? 0))).toBeCloseTo(
      2,
    )
    const farthest = Math.max(...points.map((point) => Math.abs(point[0])))
    expect(farthest).toBeLessThan(20)
  })
})
