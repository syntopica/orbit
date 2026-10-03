import type { OrbitLabelBox } from '../types/OrbitLabelBox'
import type { OrbitLabelInput } from '../types/OrbitLabelInput'

export const orbitLabelCandidate = (
  point: OrbitLabelInput,
  viewport: { readonly width: number; readonly height: number },
  radialStep: number,
  tangentStep: number,
): OrbitLabelBox => {
  const dx = point.x - viewport.width / 2
  const dy = point.y - viewport.height / 2
  const length = Math.hypot(dx, dy) || 1
  const ux = dx / length
  const uy = dy / length
  const extent = (Math.abs(ux) * point.width + Math.abs(uy) * point.height) / 2
  const distance = point.radius + 12 + extent + radialStep
  const centerX = point.x + ux * distance - uy * tangentStep
  const centerY = point.y + uy * distance + ux * tangentStep
  return {
    x: Math.max(
      12,
      Math.min(viewport.width - point.width - 12, centerX - point.width / 2),
    ),
    y: Math.max(
      12,
      Math.min(viewport.height - point.height - 12, centerY - point.height / 2),
    ),
    width: point.width,
    height: point.height,
  }
}
