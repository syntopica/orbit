import type { OrbitLabelBox } from '../types/OrbitLabelBox'
import type { OrbitLabelInput } from '../types/OrbitLabelInput'

export const orbitLeaderGeometry = (
  point: OrbitLabelInput,
  box: OrbitLabelBox,
): { x1: number; y1: number; x2: number; y2: number } => {
  const x1 = Math.max(box.x, Math.min(point.x, box.x + box.width))
  const y1 = Math.max(box.y, Math.min(point.y, box.y + box.height))
  const dx = x1 - point.x
  const dy = y1 - point.y
  const length = Math.hypot(dx, dy) || 1
  return {
    x1,
    y1,
    x2: point.x + (dx / length) * point.radius,
    y2: point.y + (dy / length) * point.radius,
  }
}
