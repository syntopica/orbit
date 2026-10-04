import { describe, expect, it } from 'vitest'

import { orbitLabelDirection } from './orbitLabelDirection'

describe('orbitLabelDirection', () => {
  it('points away from the nearest sphere', () => {
    const point = { x: 100, y: 100, radius: 20, width: 142, height: 48 }
    expect(
      orbitLabelDirection(
        point,
        [point, { ...point, x: 140 }, { ...point, x: 50, y: 150 }],
        { width: 200, height: 200 },
      ),
    ).toEqual({ x: -1, y: 0 })
  })

  it('uses the viewport center with no other sphere', () => {
    const point = { x: 150, y: 100, radius: 20, width: 142, height: 48 }
    expect(
      orbitLabelDirection(point, [point], { width: 200, height: 200 }),
    ).toEqual({
      x: 1,
      y: 0,
    })
  })
})
