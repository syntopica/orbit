import type Sigma from 'sigma'
import type { CameraState } from 'sigma/types'
import type { GraphEdgeAttributes } from '../types/GraphEdgeAttributes'
import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'
import { fitVisibleGraph } from './fitVisibleGraph'

// Project with a neutral camera so previous pan, zoom and rotation cannot
// change the fit. Sigma handles its graph normalization and viewport aspect.
export const localCameraState = (
  sigma: Sigma<GraphNodeAttributes, GraphEdgeAttributes>,
): CameraState | null => {
  const override = { cameraState: { x: 0.5, y: 0.5, ratio: 1, angle: 0 } }
  const graph = sigma.getGraph()
  const points = graph
    .filterNodes((_id, node) => !node.hidden)
    .map((id) => sigma.graphToViewport(graph.getNodeAttributes(id), override))
  const fit = fitVisibleGraph(points, sigma.getDimensions())
  if (fit === null) return null
  return {
    ...sigma.viewportToFramedGraph(fit.center, override),
    ratio: fit.ratio,
    angle: 0,
  }
}
