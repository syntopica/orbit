import type { OrbitLabelBox } from '../types/OrbitLabelBox'
import type { OrbitLabelInput } from '../types/OrbitLabelInput'
import { findOrbitLabelPlacement } from './findOrbitLabelPlacement'

export const resolveOrbitLabels = (
  points: readonly OrbitLabelInput[],
  viewport: { readonly width: number; readonly height: number },
): OrbitLabelBox[] => {
  const placed: OrbitLabelBox[] = []
  for (const point of points) {
    placed.push(findOrbitLabelPlacement(point, points, placed, viewport))
  }
  return placed
}
