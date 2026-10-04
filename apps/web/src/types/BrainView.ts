import type { BrainGraph } from '@orbit/contract'
import type Graph from 'graphology'

import type { GraphEdgeAttributes } from './GraphEdgeAttributes'
import type { GraphModel } from './GraphModel'
import type { GraphNodeAttributes } from './GraphNodeAttributes'
import type { GraphPalette } from './GraphPalette'
import type { GraphScene } from './GraphScene'

// `focus` is the page a local view is built around: the selected page, else
// the last one viewed, else the most linked one.
export type BrainView = {
  readonly data: BrainGraph | null
  readonly model: GraphModel | null
  readonly scene: GraphScene | null
  readonly graph: Graph<GraphNodeAttributes, GraphEdgeAttributes> | null
  readonly selected: number | null
  readonly focus: number | null
  readonly palette: GraphPalette
  readonly communities: number
  readonly caption: string
  readonly failed: boolean
  readonly layoutFailed: boolean
}
