import Graph from 'graphology'

import type { GraphEdgeAttributes } from '../types/GraphEdgeAttributes'
import type { GraphModel } from '../types/GraphModel'
import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'
import type { GraphPalette } from '../types/GraphPalette'

// The graph sigma draws: undirected, so a link in each direction is one edge;
// an edge is hidden when either end is.
export const toGraph = (
  model: GraphModel,
  attributes: readonly GraphNodeAttributes[],
  palette: GraphPalette,
): Graph<GraphNodeAttributes, GraphEdgeAttributes> => {
  const graph = new Graph<GraphNodeAttributes, GraphEdgeAttributes>({
    type: 'undirected',
  })
  model.ids.forEach((id, index) => {
    const node = attributes[index]
    if (node !== undefined) graph.addNode(id, node)
  })
  for (const [source, target] of model.edges) {
    const from = model.ids[source]
    const to = model.ids[target]
    if (from !== undefined && to !== undefined && from !== to)
      graph.mergeEdge(from, to, {
        color: palette.line,
        size: 1,
        hidden:
          attributes[source]?.hidden !== false ||
          attributes[target]?.hidden !== false,
      })
  }
  return graph
}
