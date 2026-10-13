import type { FullGraphState, FullNodeState } from 'sigma/types'

import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'

// Highlighted nodes keep their labels while the rest lose them; with nothing
// hovered only the nodes that force a label always show it.
export const nodeLabelVisibility = (
  attributes: GraphNodeAttributes,
  state: FullNodeState,
  graphState: FullGraphState,
): 'auto' | 'visible' | 'hidden' => {
  if (graphState.hasHighlighted) {
    return state.isHighlighted ? 'visible' : 'hidden'
  }
  return attributes.forceLabel ? 'visible' : 'auto'
}
