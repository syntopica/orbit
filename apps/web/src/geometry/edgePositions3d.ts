import type { SceneEdge } from '../types/SceneEdge'
import type { ScenePoint3d } from '../types/ScenePoint3d'

// Line-segment vertex positions for the edges between lit nodes, or all
// edges when nothing is lit.
export const edgePositions3d = (
  edges: readonly SceneEdge[],
  points: ReadonlyMap<string, ScenePoint3d>,
  lit: ReadonlySet<string> | null,
): Float32Array =>
  Float32Array.from(
    edges.flatMap((edge) => {
      const from = points.get(edge.source)
      const to = points.get(edge.target)
      const shown =
        lit === null || (lit.has(edge.source) && lit.has(edge.target))
      return from === undefined || to === undefined || !shown
        ? []
        : [...from, ...to]
    }),
  )
