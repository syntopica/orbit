import type { OrbitLabelBox } from '../types/OrbitLabelBox'
import type { OrbitLabelInput } from '../types/OrbitLabelInput'
import { orbitLabelCandidate } from './orbitLabelCandidate'
import { orbitLabelIsClear } from './orbitLabelIsClear'

export const findOrbitLabelPlacement = (
  point: OrbitLabelInput,
  points: readonly OrbitLabelInput[],
  placed: readonly OrbitLabelBox[],
  viewport: { readonly width: number; readonly height: number },
): OrbitLabelBox => {
  for (let attempt = 0; attempt < 286; attempt += 1) {
    const radial = Math.floor(attempt / 22) * 16
    const tangent = Math.floor((attempt % 22) / 2) * 20
    const direction = attempt % 2 === 0 ? 1 : -1
    const candidate = orbitLabelCandidate(
      point,
      viewport,
      radial,
      tangent * direction,
    )
    if (orbitLabelIsClear(candidate, points, placed)) return candidate
  }
  return orbitLabelCandidate(point, viewport, 0, 0)
}
