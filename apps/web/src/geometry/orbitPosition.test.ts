import { describe, expect, it } from 'vitest'

import { orbitPosition } from './orbitPosition'

describe('orbitPosition', () => {
  it('starts at the top and spaces evenly', () => {
    expect(orbitPosition(0, 4, 100)).toEqual({ x: 0, y: -100 })
    const right = orbitPosition(1, 4, 100)
    expect(right.x).toBeCloseTo(100)
    expect(right.y).toBeCloseTo(0)
  })
  it('survives an empty set', () => {
    expect(orbitPosition(0, 0, 100)).toEqual({ x: 0, y: -100 })
  })
})
