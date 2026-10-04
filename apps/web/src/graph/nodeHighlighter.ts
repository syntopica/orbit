import type Graph from 'graphology'
import type { NodeDisplayData } from 'sigma/types'

import { dimColor } from '../charts/dimColor'
import type { GraphEdgeAttributes } from '../types/GraphEdgeAttributes'
import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'

// While a node is hovered, it and its neighbours keep colour and labels;
// every other node fades and loses its label.
export const nodeHighlighter =
  (graph: Graph<GraphNodeAttributes, GraphEdgeAttributes>, centre: string) =>
  (node: string, data: GraphNodeAttributes): Partial<NodeDisplayData> =>
    node === centre || graph.areNeighbors(node, centre)
      ? { ...data, forceLabel: true, zIndex: 1 }
      : { ...data, color: dimColor(data.color), label: null, zIndex: 0 }
