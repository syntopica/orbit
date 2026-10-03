import type { Coordinates, Dimensions } from 'sigma/types'
import type { GraphViewportFit } from '../types/GraphViewportFit'

// Leave ten percent around each edge and bound the zoom for isolated pages.
export const fitVisibleGraph = (
  points: readonly Coordinates[],
  viewport: Dimensions,
): GraphViewportFit | null => {
  if (points.length === 0 || viewport.width <= 0 || viewport.height <= 0)
    return null
  let left = Infinity
  let right = -Infinity
  let top = Infinity
  let bottom = -Infinity
  for (const point of points) {
    left = Math.min(left, point.x)
    right = Math.max(right, point.x)
    top = Math.min(top, point.y)
    bottom = Math.max(bottom, point.y)
  }
  return {
    center: { x: (left + right) / 2, y: (top + bottom) / 2 },
    ratio: Math.max(
      0.1,
      (right - left) / (viewport.width * 0.8),
      (bottom - top) / (viewport.height * 0.8),
    ),
  }
}
