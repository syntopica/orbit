import type { Body3d } from '../types/Body3d'

// Two bodies push apart with force 1/d (Fruchterman-Reingold, ideal
// distance 1).
export const repelPair3d = (a: Body3d, b: Body3d): void => {
  const x = a.x - b.x
  const y = a.y - b.y
  const z = a.z - b.z
  const squared = Math.max(1e-2, x * x + y * y + z * z)
  a.dx += x / squared
  a.dy += y / squared
  a.dz += z / squared
  b.dx -= x / squared
  b.dy -= y / squared
  b.dz -= z / squared
}
