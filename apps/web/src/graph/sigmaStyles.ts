import type { GraphPalette } from '../types/GraphPalette'
import type { GraphSigmaOptions } from '../types/GraphSigmaOptions'
import { edgeColor } from './edgeColor'
import { edgeVisibility } from './edgeVisibility'
import { nodeFadeColor } from './nodeFadeColor'
import { nodeLabelVisibility } from './nodeLabelVisibility'

// Sigma 4 reads these from styles. Labels are page ids in the text token and
// edges fall back to the line token. Hovering a node highlights it, its
// neighbours and its edges; the rules below fade and hide the rest at draw
// time, so hovering never rebuilds the graph.
export const sigmaStyles = (
  palette: GraphPalette,
): NonNullable<GraphSigmaOptions['styles']> => ({
  nodes: {
    x: { attribute: 'x' },
    y: { attribute: 'y' },
    size: { attribute: 'size', defaultValue: 10 },
    color: nodeFadeColor,
    label: { attribute: 'label' },
    labelColor: palette.ink,
    labelFont: 'Geist Sans, ui-sans-serif, sans-serif',
    labelSize: 12,
    labelVisibility: nodeLabelVisibility,
    zIndex: (_attributes, state) => (state.isHighlighted ? 1 : 0),
  },
  edges: {
    size: { attribute: 'size', defaultValue: 1 },
    color: edgeColor(palette.accent),
    visibility: edgeVisibility,
    zIndex: (_attributes, state) => (state.isHighlighted ? 1 : 0),
  },
})
