import type Graph from 'graphology'
import type { EdgeDisplayData } from 'sigma/types'

import type { GraphEdgeAttributes } from '../types/GraphEdgeAttributes'
import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'

// While a node is hovered only its own edges show, in the accent colour.
export const edgeHighlighter =
  (
    graph: Graph<GraphNodeAttributes, GraphEdgeAttributes>,
    centre: string,
    accent: string,
  ) =>
  (edge: string, data: GraphEdgeAttributes): Partial<EdgeDisplayData> =>
    graph.hasExtremity(edge, centre)
      ? { ...data, color: accent, zIndex: 1 }
      : { ...data, hidden: true }
