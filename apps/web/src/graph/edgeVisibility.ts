import type { FullEdgeState, FullGraphState } from 'sigma/types'

import type { GraphEdgeAttributes } from '../types/GraphEdgeAttributes'

// While a node is hovered only its own edges (the highlighted ones) show.
export const edgeVisibility = (
  _attributes: GraphEdgeAttributes,
  state: FullEdgeState,
  graphState: FullGraphState,
): 'visible' | 'hidden' =>
  graphState.hasHighlighted && !state.isHighlighted ? 'hidden' : 'visible'
