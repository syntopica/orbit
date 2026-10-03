import type Graph from 'graphology'

import { toGraph } from '../graph/toGraph'
import type { BrainSearch } from '../types/BrainSearch'
import type { GraphEdgeAttributes } from '../types/GraphEdgeAttributes'
import type { GraphModel } from '../types/GraphModel'
import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'
import type { GraphPalette } from '../types/GraphPalette'
import type { LayoutResult } from '../types/LayoutResult'
import { selectNodeStyle } from './selectNodeStyle'
import { toNodeAttributes } from './toNodeAttributes'

export const selectBrainGraph = (
  model: GraphModel,
  layout: LayoutResult,
  search: BrainSearch,
  palette: GraphPalette,
): Graph<GraphNodeAttributes, GraphEdgeAttributes> =>
  toGraph(
    model,
    toNodeAttributes(
      model,
      layout,
      selectNodeStyle(
        model,
        search,
        search.page === undefined
          ? null
          : (model.indexOf.get(search.page) ?? null),
      ),
      palette,
    ),
    palette,
  )
