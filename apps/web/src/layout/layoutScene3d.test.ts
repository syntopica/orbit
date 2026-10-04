import Graph from 'graphology'
import { describe, expect, it } from 'vitest'

import { dimColor } from '../charts/dimColor'
import { edgePositions3d } from '../geometry/edgePositions3d'
import { nodeRadius3d } from '../geometry/nodeRadius3d'
import { sceneExtent3d } from '../geometry/sceneExtent3d'
import { edgeHighlighter } from '../graph/edgeHighlighter'
import { nodeHighlighter } from '../graph/nodeHighlighter'
import { labelledNodes3d } from '../selectors/labelledNodes3d'
import { litNodes } from '../selectors/litNodes'
import { sceneNeighbours } from '../selectors/sceneNeighbours'
import type { GraphEdgeAttributes } from '../types/GraphEdgeAttributes'
import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'
import type { GraphScene } from '../types/GraphScene'
import { layoutScene3d } from './layoutScene3d'

const node = (id: string, x: number, forceLabel = false) => ({
  id,
  label: id,
  x,
  y: x / 2,
  size: 4,
  color: '#123456',
  forceLabel,
})
// A path a-b-c, a link to a missing node, and d alone.
const scene: GraphScene = {
  nodes: [node('a', 0, true), node('b', 1), node('c', 2), node('d', 3)],
  edges: [
    { source: 'a', target: 'b', size: 1 },
    { source: 'b', target: 'c', size: 1 },
    { source: 'c', target: 'gone', size: 1 },
  ],
}
const distance = (a: readonly number[], b: readonly number[]) =>
  Math.hypot(...a.map((value, axis) => value - (b[axis] ?? 0)))

describe('layoutScene3d', () => {
  it('is deterministic, finite and lifted off the plane', () => {
    const points = layoutScene3d(scene)
    expect(layoutScene3d(scene)).toEqual(points)
    const all = [...points.values()]
    expect(all.flat().every(Number.isFinite)).toBe(true)
    expect(all.some((point) => point[2] !== 0)).toBe(true)
    expect(sceneExtent3d(scene, points)).toBeGreaterThan(1)
  })
  it('keeps linked nodes closer than unlinked ones', () => {
    const points = layoutScene3d(scene)
    const at = (id: string) => points.get(id) ?? [0, 0, 0]
    expect(distance(at('a'), at('b'))).toBeLessThan(distance(at('a'), at('d')))
  })
  it('places a lone node at the origin and an empty scene nowhere', () => {
    expect([...layoutScene3d({ nodes: [node('a', 5)], edges: [] })]).toEqual([
      ['a', [0, 0, 0]],
    ])
    expect(layoutScene3d({ nodes: [], edges: [] }).size).toBe(0)
  })
})

describe('3D hover and labels', () => {
  it('lights the hovered node with its neighbours and their edges', () => {
    const lit = litNodes(sceneNeighbours(scene), 'b')
    expect([...(lit ?? [])].toSorted()).toEqual(['a', 'b', 'c'])
    expect(litNodes(sceneNeighbours(scene), null)).toBeNull()
    const points = new Map([
      ['a', [0, 0, 0] as const],
      ['b', [1, 1, 1] as const],
      ['c', [2, 2, 2] as const],
    ])
    expect([...edgePositions3d(scene.edges, points, null)]).toHaveLength(12)
    expect([
      ...edgePositions3d(scene.edges, points, new Set(['a', 'b'])),
    ]).toEqual([0, 0, 0, 1, 1, 1])
  })
  it('labels forced nodes, or the lit ones while hovering', () => {
    expect(labelledNodes3d(scene.nodes, null).map((n) => n.id)).toEqual(['a'])
    expect(
      labelledNodes3d(scene.nodes, new Set(['b', 'c'])).map((n) => n.id),
    ).toEqual(['b', 'c'])
  })
})

describe('2D highlight reducers', () => {
  const graph = new Graph<GraphNodeAttributes, GraphEdgeAttributes>({
    type: 'undirected',
  })
  for (const { id, ...attributes } of scene.nodes) graph.addNode(id, attributes)
  graph.addEdge('a', 'b', { color: '#line00', size: 1 })
  graph.addEdge('b', 'c', { color: '#line00', size: 1 })
  it('keeps the hovered neighbourhood and fades the rest', () => {
    const reduce = nodeHighlighter(graph, 'a')
    const data = graph.getNodeAttributes('b')
    expect(reduce('b', data)).toMatchObject({ forceLabel: true, zIndex: 1 })
    expect(reduce('c', graph.getNodeAttributes('c'))).toMatchObject({
      color: '#1234561a',
      label: null,
    })
    expect(dimColor('rgb(1, 2, 3)')).toBe('rgb(1, 2, 3)')
  })
  it('shows only the hovered node edges, in the accent', () => {
    const reduce = edgeHighlighter(graph, 'a', '#accent')
    const [first, second] = graph.edges()
    expect(reduce(first ?? '', { color: '#line00', size: 1 })).toMatchObject({
      color: '#accent',
    })
    expect(reduce(second ?? '', { color: '#line00', size: 1 })).toMatchObject({
      hidden: true,
    })
  })
  it('keeps big spheres apart however close they start', () => {
    // Eleven community-sized spheres stacked near one point, as an opened
    // overview group used to draw them, plus one far outlier.
    const crowded: GraphScene = {
      nodes: [
        ...Array.from({ length: 11 }, (_, index) => ({
          ...node(`c${String(index)}`, index * 0.01),
          size: 23 - index,
        })),
        { ...node('far', 500), size: 23 },
      ],
      edges: [],
    }
    const points = layoutScene3d(crowded)
    const at = crowded.nodes.map((n) => points.get(n.id) ?? [0, 0, 0])
    const radius = (index: number) =>
      nodeRadius3d(crowded.nodes[index]?.size ?? 0)
    at.forEach((point, i) => {
      for (let j = i + 1; j < at.length; j += 1)
        expect(distance(point, at[j] ?? [0, 0, 0])).toBeGreaterThanOrEqual(
          radius(i) + radius(j) - 1e-6,
        )
    })
  })
})
