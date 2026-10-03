import type { BrainGraph } from '@orbit/contract'
import type Graph from 'graphology'

import type { GraphEdgeAttributes } from './GraphEdgeAttributes'
import type { GraphModel } from './GraphModel'
import type { GraphNodeAttributes } from './GraphNodeAttributes'
import type { GraphPalette } from './GraphPalette'

export type BrainView = {
  readonly data: BrainGraph | null
  readonly model: GraphModel | null
  readonly graph: Graph<GraphNodeAttributes, GraphEdgeAttributes> | null
  readonly selected: number | null
  readonly palette: GraphPalette
  readonly communities: number
  readonly failed: boolean
  readonly layoutFailed: boolean
}
