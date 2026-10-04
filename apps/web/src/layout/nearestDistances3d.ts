import type { ScenePoint3d } from '../types/ScenePoint3d'

// Each point's distance to its nearest other point; none for a lone point.
export const nearestDistances3d = (
  points: readonly ScenePoint3d[],
): number[] =>
  points.length < 2
    ? []
    : points.map((a, i) =>
        Math.min(
          ...points
            .filter((_, j) => j !== i)
            .map((b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])),
        ),
      )
