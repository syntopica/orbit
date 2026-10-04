import type { Vec3d } from '../types/Vec3d'

// Moves two centres apart, half the overlap each, until they are `need`
// apart; coincident centres split along x. Returns whether either moved.
export const pushApart3d = (a: Vec3d, b: Vec3d, need: number): boolean => {
  const x = b[0] - a[0]
  const y = b[1] - a[1]
  const z = b[2] - a[2]
  const distance = Math.hypot(x, y, z)
  if (distance >= need) return false
  const push = (need - distance) / 2
  const unit: Vec3d =
    distance < 1e-9 ? [1, 0, 0] : [x / distance, y / distance, z / distance]
  for (let axis = 0; axis < 3; axis += 1) {
    a[axis] = (a[axis] ?? 0) - (unit[axis] ?? 0) * push
    b[axis] = (b[axis] ?? 0) + (unit[axis] ?? 0) * push
  }
  return true
}
