import type { ScenePoint3d } from '../types/ScenePoint3d'
import type { Vec3d } from '../types/Vec3d'
import { pushApart3d } from './pushApart3d'
import { SPHERE_GAP_3D } from './sphereGap3d'

// Pushes overlapping spheres apart until none overlap or the passes run out.
export const separateSpheres3d = (
  points: readonly ScenePoint3d[],
  radii: readonly number[],
  passes: number,
): ScenePoint3d[] => {
  const at = points.map(([x, y, z]): Vec3d => [x, y, z])
  for (let pass = 0; pass < passes; pass += 1) {
    let moved = 0
    for (const [i, a] of at.entries())
      for (const [offset, b] of at.slice(i + 1).entries()) {
        const need =
          (radii[i] ?? 0) + (radii[i + 1 + offset] ?? 0) + SPHERE_GAP_3D
        if (pushApart3d(a, b, need)) moved += 1
      }
    if (moved === 0) break
  }
  return at.map(([x, y, z]): ScenePoint3d => [x, y, z])
}
