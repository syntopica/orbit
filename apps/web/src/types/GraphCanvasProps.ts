import type Graph from 'graphology'

import type { GraphEdgeAttributes } from './GraphEdgeAttributes'
import type { GraphNodeAttributes } from './GraphNodeAttributes'
import type { GraphPalette } from './GraphPalette'

export type GraphCanvasProps = {
  readonly graph: Graph<GraphNodeAttributes, GraphEdgeAttributes>
  readonly palette: GraphPalette
  readonly onSelect: (id: string | null) => void
  readonly animate: boolean
}
