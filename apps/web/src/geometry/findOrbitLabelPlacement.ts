import type { OrbitLabelBox } from '../types/OrbitLabelBox'
import type { OrbitLabelInput } from '../types/OrbitLabelInput'
import { orbitLabelCandidate } from './orbitLabelCandidate'
import { orbitLabelDirection } from './orbitLabelDirection'
import { orbitLabelIsClear } from './orbitLabelIsClear'

export const findOrbitLabelPlacement = (
  point: OrbitLabelInput,
  points: readonly OrbitLabelInput[],
  placed: readonly OrbitLabelBox[],
  viewport: { readonly width: number; readonly height: number },
): OrbitLabelBox => {
  const preferred = orbitLabelDirection(point, points, viewport)
  const radial = orbitLabelDirection(point, [point], viewport)
  const directions = [
    preferred,
    radial,
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ]
  for (const direction of directions) {
    for (let attempt = 0; attempt < 286; attempt += 1) {
      const radialStep = Math.floor(attempt / 22) * 16
      const tangent = Math.floor((attempt % 22) / 2) * 20
      const sign = attempt % 2 === 0 ? 1 : -1
      const candidate = orbitLabelCandidate(point, viewport, direction, {
        radial: radialStep,
        tangent: tangent * sign,
      })
      if (orbitLabelIsClear(candidate, points, placed)) return candidate
    }
  }
  return orbitLabelCandidate(point, viewport, preferred, {
    radial: 0,
    tangent: 0,
  })
}
