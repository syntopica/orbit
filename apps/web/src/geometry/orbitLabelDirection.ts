import type { OrbitLabelInput } from '../types/OrbitLabelInput'

export const orbitLabelDirection = (
  point: OrbitLabelInput,
  points: readonly OrbitLabelInput[],
  viewport: { readonly width: number; readonly height: number },
): { x: number; y: number } => {
  let nearest: OrbitLabelInput | null = null
  let nearestDistance = Infinity
  for (const other of points) {
    if (other === point) continue
    const distance = (point.x - other.x) ** 2 + (point.y - other.y) ** 2
    if (distance >= nearestDistance) continue
    nearest = other
    nearestDistance = distance
  }
  const x =
    nearest === null ? point.x - viewport.width / 2 : point.x - nearest.x
  const y =
    nearest === null ? point.y - viewport.height / 2 : point.y - nearest.y
  const length = Math.hypot(x, y) || 1
  return { x: x / length, y: y / length }
}
