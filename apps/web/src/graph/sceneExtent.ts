import type { Coordinates } from 'sigma/types'

// The larger side of the box around `points`, at least 1.
export const sceneExtent = (points: readonly Coordinates[]): number => {
  if (points.length === 0) return 1
  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  return Math.max(
    1,
    Math.max(...xs) - Math.min(...xs),
    Math.max(...ys) - Math.min(...ys),
  )
}
