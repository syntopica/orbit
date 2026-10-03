import { describe, expect, it } from 'vitest'

import { buildGraphModel } from '../selectors/buildGraphModel'
import { toNodeAttributes } from '../selectors/toNodeAttributes'
import type { GraphPalette } from '../types/GraphPalette'
import { toGraph } from './toGraph'

const palette: GraphPalette = {
  scheme: 'dark',
  series: ['#s1', '#s2', '#s3', '#s4', '#s5', '#s6'],
  warn: '#warn',
  accent: '#accent',
  line: '#line',
  ink: '#ink',
}
const model = buildGraphModel({
  now: 0,
  nodes: [
    { id: 'notes/a', type: 'topic', degree: 1, orphan: true },
    { id: 'notes/b', type: 'project', degree: 1, orphan: false },
  ],
  edges: [
    [1, 0],
    [0, 1],
  ],
  dangling: 0,
  skipped: 0,
})
const layout = { x: [1, 2], y: [3, 4], community: [5, 5] }

describe('toNodeAttributes', () => {
  it('places, sizes and colours nodes by type or community', () => {
    const byType = toNodeAttributes(
      model,
      layout,
      {
        colorBy: 'type',
        highlightOrphans: false,
        selected: null,
        visible: [true, false],
      },
      palette,
    )
    expect(byType).toEqual([
      { label: 'notes/a', x: 1, y: 3, size: 3.5, color: '#s2', hidden: false },
      { label: 'notes/b', x: 2, y: 4, size: 3.5, color: '#s1', hidden: true },
    ])
    const byCommunity = toNodeAttributes(
      model,
      layout,
      {
        colorBy: 'community',
        highlightOrphans: true,
        selected: 1,
        visible: [true, true],
      },
      palette,
    )
    expect(byCommunity.map((node) => node.color)).toEqual(['#warn', '#accent'])
  })
})

describe('toGraph', () => {
  it('merges both directions into one undirected edge, hidden with a hidden end', () => {
    const attributes = toNodeAttributes(
      model,
      layout,
      {
        colorBy: 'type',
        highlightOrphans: false,
        selected: null,
        visible: [true, false],
      },
      palette,
    )
    const graph = toGraph(model, attributes, palette)
    expect([graph.order, graph.size]).toEqual([2, 1])
    expect(graph.getEdgeAttributes(graph.edges()[0] ?? '')).toEqual({
      color: '#line',
      size: 1,
      hidden: true,
    })
    expect(graph.getNodeAttribute('notes/a', 'x')).toBe(1)
  })
})
