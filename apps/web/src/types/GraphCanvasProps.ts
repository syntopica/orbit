import type Graph from 'graphology'
import type { GraphDepth } from './GraphDepth'

import type { GraphEdgeAttributes } from './GraphEdgeAttributes'
import type { GraphNodeAttributes } from './GraphNodeAttributes'
import type { GraphPalette } from './GraphPalette'

export type GraphCanvasProps = {
  readonly graph: Graph<GraphNodeAttributes, GraphEdgeAttributes>
  readonly palette: GraphPalette
  readonly selectedId: string | null
  readonly onSelect: (id: string | null) => void
  readonly depth: GraphDepth
  readonly animate: boolean
}
