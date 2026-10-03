import Graph from 'graphology'
import louvain from 'graphology-communities-louvain'
import forceAtlas2 from 'graphology-layout-forceatlas2'

import type { LayoutRequest } from '../types/LayoutRequest'
import type { LayoutResult } from '../types/LayoutResult'
import { seededRandom } from './seededRandom'

// Runs inside the layout worker (D9). Nodes start on a circle in index order
// and Louvain draws from a seeded generator, so a graph always lays out the
// same way. An edgeless graph has one community per node.
export const computeLayout = (request: LayoutRequest): LayoutResult => {
  const { order } = request
  if (order === 0) return { x: [], y: [], community: [] }
  const graph = new Graph<{ x: number; y: number }>({ type: 'undirected' })
  for (let index = 0; index < order; index += 1) {
    const angle = (2 * Math.PI * index) / order
    graph.addNode(String(index), {
      x: 100 * Math.cos(angle),
      y: 100 * Math.sin(angle),
    })
  }
  for (const [source, target] of request.edges)
    if (source !== target && Math.max(source, target) < order)
      graph.mergeEdge(String(source), String(target))
  forceAtlas2.assign(graph, {
    iterations: 300,
    settings: {
      ...forceAtlas2.inferSettings(graph),
      barnesHutOptimize: order > 1000,
    },
  })
  const communities: Readonly<Record<string, number>> =
    graph.size === 0 ? {} : louvain(graph, { rng: seededRandom(request.seed) })
  const keys = graph.nodes()
  return {
    x: keys.map((key) => graph.getNodeAttribute(key, 'x')),
    y: keys.map((key) => graph.getNodeAttribute(key, 'y')),
    community: keys.map((key, index) => communities[key] ?? index),
  }
}
