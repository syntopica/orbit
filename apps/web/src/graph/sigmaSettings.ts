import type { Settings } from 'sigma/settings'

// Edges are hairlines. A sparse label grid keeps the dense centre legible;
// zooming in or hovering shows the rest.
export const sigmaSettings = (): Partial<Settings> => ({
  labelRenderedSizeThreshold: 10,
  labelDensity: 0.5,
  labelGridCellSize: 160,
  renderEdgeLabels: false,
})
