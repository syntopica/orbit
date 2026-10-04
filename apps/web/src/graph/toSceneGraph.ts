import Graph from 'graphology'

import type { GraphEdgeAttributes } from '../types/GraphEdgeAttributes'
import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'
import type { GraphPalette } from '../types/GraphPalette'
import type { GraphScene } from '../types/GraphScene'

// The graph sigma draws: exactly the scene's nodes and edges, undirected.
export const toSceneGraph = (
  scene: GraphScene,
  palette: GraphPalette,
): Graph<GraphNodeAttributes, GraphEdgeAttributes> => {
  const graph = new Graph<GraphNodeAttributes, GraphEdgeAttributes>({
    type: 'undirected',
  })
  for (const { id, ...node } of scene.nodes) graph.addNode(id, node)
  for (const edge of scene.edges)
    graph.mergeEdge(edge.source, edge.target, {
      color: palette.line,
      size: edge.size,
    })
  return graph
}
