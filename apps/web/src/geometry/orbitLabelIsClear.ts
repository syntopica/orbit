import type { OrbitLabelBox } from '../types/OrbitLabelBox'
import type { OrbitLabelInput } from '../types/OrbitLabelInput'

export const orbitLabelIsClear = (
  box: OrbitLabelBox,
  points: readonly OrbitLabelInput[],
  placed: readonly OrbitLabelBox[],
): boolean => {
  const gap = 5
  if (
    placed.some(
      (other) =>
        box.x < other.x + other.width + gap &&
        box.x + box.width + gap > other.x &&
        box.y < other.y + other.height + gap &&
        box.y + box.height + gap > other.y,
    )
  )
    return false
  return points.every((point) => {
    const x = Math.max(box.x, Math.min(point.x, box.x + box.width))
    const y = Math.max(box.y, Math.min(point.y, box.y + box.height))
    return Math.hypot(point.x - x, point.y - y) > point.radius + gap
  })
}
