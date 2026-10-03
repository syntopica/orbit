import { describe, expect, it } from 'vitest'

import type { GraphPalette } from '../types/GraphPalette'
import { communitySlots } from './communitySlots'
import { nodeColor } from './nodeColor'
import { nodeSize } from './nodeSize'
import { typeSlots } from './typeSlots'

const palette: GraphPalette = {
  scheme: 'dark',
  series: ['#s1', '#s2', '#s3', '#s4', '#s5', '#s6'],
  warn: '#warn',
  accent: '#accent',
  line: '#line',
  ink: '#ink',
}

describe('typeSlots', () => {
  it('ranks types by page count, ties by name, and folds the rest into 6', () => {
    const types = ['t', 't', 't', 'p', 'p', 'b', 'a', 'c', 'd', 'e']
    expect([...typeSlots(types)]).toEqual([
      ['t', 1],
      ['p', 2],
      ['a', 3],
      ['b', 4],
      ['c', 5],
      ['d', 6],
      ['e', 6],
    ])
  })
})

describe('communitySlots', () => {
  it('ranks communities by size and maps each node to its slot', () => {
    expect(communitySlots([7, 7, 3, 3, 3, 9])).toEqual([2, 2, 1, 1, 1, 3])
  })
})

describe('nodeSize', () => {
  it('grows with the square root of degree and caps at 16', () => {
    expect(nodeSize(0)).toBe(2)
    expect(nodeSize(4)).toBe(5)
    expect(nodeSize(10_000)).toBe(16)
  })
})

describe('nodeColor', () => {
  const base = {
    slot: 2,
    orphan: false,
    selected: false,
    highlightOrphans: true,
  }
  it('uses selection, then the orphan highlight, then the series slot', () => {
    expect(nodeColor({ ...base, selected: true, orphan: true }, palette)).toBe(
      '#accent',
    )
    expect(nodeColor({ ...base, orphan: true }, palette)).toBe('#warn')
    expect(
      nodeColor({ ...base, orphan: true, highlightOrphans: false }, palette),
    ).toBe('#s2')
    expect(nodeColor({ ...base, slot: 9 }, palette)).toBe('#s6')
  })
})
