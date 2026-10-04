import Graph from 'graphology'
import noverlap from 'graphology-layout-noverlap'

import type { SceneNode } from '../types/SceneNode'
import { FITTED_PIXELS } from './fittedPixels'
import { sceneExtent } from './sceneExtent'

// Pushes overlapping nodes apart (noverlap), so large community nodes never
// cover each other; positions that do not overlap barely move.
export const spreadOverlaps = (
  nodes: readonly SceneNode[],
): readonly SceneNode[] => {
  const scale = sceneExtent(nodes) / FITTED_PIXELS
  const graph = new Graph()
  for (const node of nodes)
    graph.addNode(node.id, { x: node.x, y: node.y, size: node.size * scale })
  const spread = noverlap(graph, {
    maxIterations: 80,
    settings: { margin: 3 * scale, ratio: 1, expansion: 1.1 },
  })
  return nodes.map((node) => ({ ...node, ...spread[node.id] }))
}
