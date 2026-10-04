import { describe, expect, it } from 'vitest'

import type { Vec3d } from '../types/Vec3d'
import { pushApart3d } from './pushApart3d'

describe('pushApart3d', () => {
  it('leaves centres that are far enough apart alone', () => {
    const a: Vec3d = [0, 0, 0]
    const b: Vec3d = [3, 0, 0]
    expect(pushApart3d(a, b, 2)).toBe(false)
    expect([a, b]).toEqual([
      [0, 0, 0],
      [3, 0, 0],
    ])
  })
  it('moves overlapping centres apart by half the overlap each', () => {
    const a: Vec3d = [0, 0, 0]
    const b: Vec3d = [0, 1, 0]
    expect(pushApart3d(a, b, 3)).toBe(true)
    expect(a[1]).toBeCloseTo(-1)
    expect(b[1]).toBeCloseTo(2)
  })
  it('splits coincident centres along x', () => {
    const a: Vec3d = [1, 1, 1]
    const b: Vec3d = [1, 1, 1]
    expect(pushApart3d(a, b, 2)).toBe(true)
    expect([a, b]).toEqual([
      [0, 1, 1],
      [2, 1, 1],
    ])
  })
})
