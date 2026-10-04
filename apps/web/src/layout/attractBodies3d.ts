import type { Body3d } from '../types/Body3d'
import type { BodyPair3d } from '../types/BodyPair3d'
import { GRAVITY_3D } from './gravity3d'

// Linked bodies pull together with force d² (Fruchterman-Reingold, ideal
// distance 1), and every body drifts slightly to the centre, so separate
// components stay in view.
export const attractBodies3d = (
  pairs: readonly BodyPair3d[],
  bodies: readonly Body3d[],
): void => {
  for (const [a, b] of pairs) {
    const x = a.x - b.x
    const y = a.y - b.y
    const z = a.z - b.z
    const distance = Math.hypot(x, y, z)
    a.dx -= x * distance
    a.dy -= y * distance
    a.dz -= z * distance
    b.dx += x * distance
    b.dy += y * distance
    b.dz += z * distance
  }
  for (const body of bodies) {
    body.dx -= body.x * GRAVITY_3D
    body.dy -= body.y * GRAVITY_3D
    body.dz -= body.z * GRAVITY_3D
  }
}
