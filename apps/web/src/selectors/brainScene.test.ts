import type { BrainGraph } from '@orbit/contract'
import { describe, expect, it } from 'vitest'

import { formatViewCaption } from '../formatters/formatViewCaption'
import { toSceneGraph } from '../graph/toSceneGraph'
import { computeLayout } from '../layout/computeLayout'
import type { GraphPalette } from '../types/GraphPalette'
import type { SceneStyle } from '../types/SceneStyle'
import { aggregateEdges } from './aggregateEdges'
import { buildGraphModel } from './buildGraphModel'
import { groupClusters } from './groupClusters'
import { pageSlots } from './pageSlots'
import { selectBrainScene } from './selectBrainScene'

const palette: GraphPalette = {
  scheme: 'dark',
  series: ['#000001', '#000002', '#000003', '#000004', '#000005', '#000006'],
  warn: '#00000a',
  accent: '#00000b',
  line: '#00000c',
  ink: '#00000d',
}
// Two triangles joined by c-d, and two pages with no links (g, h).
const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const links: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 0],
  [3, 4],
  [4, 5],
  [5, 3],
  [2, 3],
]
const degree = [2, 2, 3, 3, 2, 2, 0, 0]
const data: BrainGraph = {
  now: 0,
  nodes: ids.map((id, index) => ({
    id: `notes/${id}`,
    type: index < 3 ? 'topic' : 'project',
    degree: degree[index] ?? 0,
    orphan: index > 5,
  })),
  edges: links,
  dangling: 0,
  skipped: 0,
}
const model = buildGraphModel(data)
const layout = computeLayout({ order: ids.length, edges: links, seed: 1 })
const style: SceneStyle = {
  model,
  layout,
  palette,
  slots: pageSlots(model, layout, 'type'),
  highlightOrphans: true,
  focus: 0,
}
const search = {
  depth: 1 as const,
  color: 'type' as const,
  orphans: true,
  hide: [],
  hideOrphans: false,
  maxLinks: null,
  cluster: null,
  scene: '2d' as const,
  range: '24h' as const,
}

describe('local view', () => {
  it('draws the focus at the centre and each step on a wider ring', () => {
    const scene = selectBrainScene(style, { ...search, depth: 2 })
    const at = new Map(scene.nodes.map((node) => [node.id, node]))
    expect([...at.keys()].toSorted()).toEqual([
      'notes/a',
      'notes/b',
      'notes/c',
      'notes/d',
    ])
    expect(at.get('notes/a')).toMatchObject({ x: 0, y: 0, color: '#00000b' })
    const radius = (id: string) =>
      Math.hypot(at.get(id)?.x ?? 0, at.get(id)?.y ?? 0)
    expect(radius('notes/b')).toBeCloseTo(radius('notes/c'))
    expect(radius('notes/d')).toBeGreaterThan(radius('notes/c'))
    expect(scene.edges).toHaveLength(4)
    expect(scene.nodes.every((node) => node.forceLabel)).toBe(true)
  })
  it('lays out the same view the same way and stops at hidden hubs', () => {
    expect(selectBrainScene(style, search)).toEqual(
      selectBrainScene(style, search),
    )
    const capped = selectBrainScene(style, { ...search, depth: 3, maxLinks: 2 })
    expect(capped.nodes.map((node) => node.id).toSorted()).toEqual([
      'notes/a',
      'notes/b',
    ])
  })
  it('is empty without a focus', () => {
    expect(selectBrainScene({ ...style, focus: null }, search)).toEqual({
      nodes: [],
      edges: [],
    })
  })
})

describe('overview', () => {
  it('collapses communities and folds loose pages into one group', () => {
    expect(
      groupClusters(
        layout.community,
        ids.map(() => true),
      ).map((group) => group.members),
    ).toEqual([
      [0, 1, 2],
      [3, 4, 5],
      [6, 7],
    ])
    const scene = selectBrainScene(style, { ...search, depth: 0 })
    expect(scene.nodes.map((node) => node.label)).toEqual([
      'notes/c · 3 pages',
      'notes/d · 3 pages',
      'Unlinked pages · 2',
    ])
    expect(scene.edges).toHaveLength(1)
    expect(scene.nodes[0]?.color).toBe('#000002')
  })
  it('opens one community into its pages and keeps links to the others', () => {
    const community = layout.community[0] ?? 0
    const scene = selectBrainScene(style, {
      ...search,
      depth: 0,
      cluster: community,
    })
    expect(scene.nodes.map((node) => node.id)).toEqual([
      'notes/a',
      'notes/b',
      'notes/c',
      `cluster:${String(layout.community[3])}`,
      'cluster:-1',
    ])
    expect(scene.edges).toHaveLength(4)
    expect(formatViewCaption(0, null, scene)).toBe(
      'Overview: 2 groups, one opened into 3 pages',
    )
  })
  it('pushes overlapping groups apart', () => {
    const stacked = {
      ...layout,
      x: layout.x.map(() => 0),
      y: layout.y.map(() => 0),
    }
    const scene = selectBrainScene(
      { ...style, layout: stacked },
      { ...search, depth: 0 },
    )
    const [first, second] = scene.nodes
    expect(
      Math.hypot(
        (first?.x ?? 0) - (second?.x ?? 0),
        (first?.y ?? 0) - (second?.y ?? 0),
      ),
    ).toBeGreaterThan(0)
  })
})

describe('aggregateEdges', () => {
  it('merges directions and adds up folded links', () => {
    const edges = aggregateEdges(
      [
        [0, 1],
        [1, 0],
        [0, 2],
        [3, 3],
        [0, 4],
      ],
      (index) => (index === 4 ? null : index === 0 ? 'x' : 'y'),
    )
    expect(edges).toEqual([
      { source: 'x', target: 'y', size: 1.584962500721156 },
    ])
  })
})

describe('toSceneGraph and the caption', () => {
  it('builds exactly the scene, edges in the line colour', () => {
    const scene = selectBrainScene(style, search)
    const graph = toSceneGraph(scene, palette)
    expect([graph.order, graph.size]).toEqual([3, 3])
    expect(graph.getEdgeAttributes(graph.edges()[0] ?? '')).toEqual({
      color: '#00000c',
      size: 1,
    })
    expect(formatViewCaption(1, 'notes/a', scene)).toBe(
      '1 step around notes/a: 3 pages',
    )
    expect(formatViewCaption(2, null, { nodes: [], edges: [] })).toBe(
      '2 steps around -: 0 pages',
    )
  })
})
