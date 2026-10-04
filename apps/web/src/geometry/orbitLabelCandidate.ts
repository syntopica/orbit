import type { OrbitLabelBox } from '../types/OrbitLabelBox'
import type { OrbitLabelInput } from '../types/OrbitLabelInput'

export const orbitLabelCandidate = (
  point: OrbitLabelInput,
  viewport: { readonly width: number; readonly height: number },
  direction: { readonly x: number; readonly y: number },
  offset: { readonly radial: number; readonly tangent: number },
): OrbitLabelBox => {
  const ux = direction.x
  const uy = direction.y
  const extent = (Math.abs(ux) * point.width + Math.abs(uy) * point.height) / 2
  const distance = point.radius + 12 + extent + offset.radial
  const centerX = point.x + ux * distance - uy * offset.tangent
  const centerY = point.y + uy * distance + ux * offset.tangent
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
