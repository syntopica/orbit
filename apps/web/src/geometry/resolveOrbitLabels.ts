import type { OrbitLabelBox } from '../types/OrbitLabelBox'
import type { OrbitLabelInput } from '../types/OrbitLabelInput'
import type { ViewportSize } from '../types/ViewportSize'
import { findOrbitLabelPlacement } from './findOrbitLabelPlacement'

export const resolveOrbitLabels = (
  points: readonly OrbitLabelInput[],
  viewport: ViewportSize,
): OrbitLabelBox[] => {
  const placed: OrbitLabelBox[] = []
  for (const point of points) {
    placed.push(findOrbitLabelPlacement(point, points, placed, viewport))
  }
  return placed
}
