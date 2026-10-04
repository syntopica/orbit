import type { Body3d } from '../types/Body3d'
import type { ScenePoint3d } from '../types/ScenePoint3d'

// Positions centred on their mean and scaled so the farthest body sits at
// `radius`; a single body sits at the origin.
export const normalizeBodies3d = (
  bodies: readonly Body3d[],
  radius: number,
): readonly ScenePoint3d[] => {
  const count = Math.max(1, bodies.length)
  const cx = bodies.reduce((sum, body) => sum + body.x, 0) / count
  const cy = bodies.reduce((sum, body) => sum + body.y, 0) / count
  const cz = bodies.reduce((sum, body) => sum + body.z, 0) / count
  const centred = bodies.map((body): ScenePoint3d => [
    body.x - cx,
    body.y - cy,
    body.z - cz,
  ])
  const farthest = Math.max(0, ...centred.map((point) => Math.hypot(...point)))
  const scale = farthest === 0 ? 0 : radius / farthest
  return centred.map(([x, y, z]) => [x * scale, y * scale, z * scale])
}
