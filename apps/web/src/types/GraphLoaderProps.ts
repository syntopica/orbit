import type Graph from 'graphology'

import type { GraphEdgeAttributes } from './GraphEdgeAttributes'
import type { GraphNodeAttributes } from './GraphNodeAttributes'

export type GraphLoaderProps = {
  readonly graph: Graph<GraphNodeAttributes, GraphEdgeAttributes>
}
