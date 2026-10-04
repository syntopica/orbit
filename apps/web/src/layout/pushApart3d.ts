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
  const [ux, uy, uz]: Vec3d =
    distance < 1e-9 ? [1, 0, 0] : [x / distance, y / distance, z / distance]
  a[0] -= ux * push
  a[1] -= uy * push
  a[2] -= uz * push
  b[0] += ux * push
  b[1] += uy * push
  b[2] += uz * push
  return true
}
