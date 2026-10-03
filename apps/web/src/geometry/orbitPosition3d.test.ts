import { describe, expect, it } from 'vitest'

import { orbitPosition3d } from './orbitPosition3d'

describe('orbitPosition3d', () => {
  it('places satellites on two tilted lanes and rotates with time', () => {
    const first = orbitPosition3d(0, 0)
    expect(first[0]).toBeCloseTo(0)
    expect(first[1]).toBeCloseTo(-1.7625)
    expect(first[2]).toBeCloseTo(-1.222)
    expect(orbitPosition3d(3, 0)[1]).toBeLessThan(-2)
    expect(orbitPosition3d(0, Math.PI / 2)[0]).toBeCloseTo(2.35)
  })
})
