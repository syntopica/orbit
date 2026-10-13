import type { FullGraphState, FullNodeState } from 'sigma/types'

import { dimColor } from '../charts/dimColor'
import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'

// While a node is hovered, it and its neighbours (the highlighted nodes) keep
// their colour; every other node fades.
export const nodeFadeColor = (
  attributes: GraphNodeAttributes,
  state: FullNodeState,
  graphState: FullGraphState,
): string =>
  graphState.hasHighlighted && !state.isHighlighted
    ? dimColor(attributes.color)
    : attributes.color
