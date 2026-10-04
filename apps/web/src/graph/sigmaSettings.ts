import type { Settings } from 'sigma/settings'

import type { GraphEdgeAttributes } from '../types/GraphEdgeAttributes'
import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'
import type { GraphPalette } from '../types/GraphPalette'

// Labels are page ids in the text token; edges are hairlines. A sparse label
// grid keeps the dense centre legible; zooming in or hovering shows the rest.
export const sigmaSettings = (
  palette: GraphPalette,
): Partial<Settings<GraphNodeAttributes, GraphEdgeAttributes>> => ({
  labelColor: { color: palette.ink },
  labelFont: 'Geist Sans, ui-sans-serif, sans-serif',
  labelSize: 12,
  labelRenderedSizeThreshold: 10,
  labelDensity: 0.5,
  labelGridCellSize: 160,
  defaultEdgeColor: palette.line,
  renderEdgeLabels: false,
  zIndex: true,
})
