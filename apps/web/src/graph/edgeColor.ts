import type { FullEdgeState } from 'sigma/types'

import type { GraphEdgeAttributes } from '../types/GraphEdgeAttributes'

// The highlighted edges of the hovered node show in the accent colour.
export const edgeColor =
  (accent: string) =>
  (attributes: GraphEdgeAttributes, state: FullEdgeState): string =>
    state.isHighlighted ? accent : attributes.color
