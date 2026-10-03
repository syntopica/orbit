import { describe, expect, it } from 'vitest'

import { computeLayout } from './computeLayout'
import { seededRandom } from './seededRandom'

// Two triangles joined by one edge: 0-1-2 and 3-4-5, with 2-3.
const edges: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 0],
  [3, 4],
  [4, 5],
  [5, 3],
  [2, 3],
]

describe('seededRandom', () => {
  it('repeats for a seed and stays in [0, 1)', () => {
    const a = seededRandom(7)
    const b = seededRandom(7)
    const values = [a(), a(), a()]
    expect([b(), b(), b()]).toEqual(values)
    for (const value of values) expect(value >= 0 && value < 1).toBe(true)
  })
})

describe('computeLayout', () => {
  it('lays out the same graph the same way, with finite positions', () => {
    const first = computeLayout({ order: 6, edges, seed: 1 })
    expect(computeLayout({ order: 6, edges, seed: 1 })).toEqual(first)
    expect(first.x).toHaveLength(6)
    expect([...first.x, ...first.y].every(Number.isFinite)).toBe(true)
  })
  it('finds the two triangles as two communities', () => {
    const { community } = computeLayout({ order: 6, edges, seed: 1 })
    expect(community[0]).toBe(community[1])
    expect(community[3]).toBe(community[4])
    expect(community[0]).not.toBe(community[3])
  })
  it('gives each node of an edgeless graph its own community', () => {
    expect(computeLayout({ order: 3, edges: [], seed: 1 }).community).toEqual([
      0, 1, 2,
    ])
    expect(computeLayout({ order: 0, edges: [], seed: 1 })).toEqual({
      x: [],
      y: [],
      community: [],
    })
  })
})
