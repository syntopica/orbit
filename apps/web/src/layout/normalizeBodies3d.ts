import type { Body3d } from '../types/Body3d'
import type { ScenePoint3d } from '../types/ScenePoint3d'
import { median3d } from './median3d'
import { nearestDistances3d } from './nearestDistances3d'

// Positions centred on their per-axis median and scaled so a typical node
// sits `spacing` from its nearest neighbour. A loose node the relaxation
// pushed far out is drawn in to just past the distance most nodes keep from
// the centre, so it can neither drag the centre nor make the camera back away.
export const normalizeBodies3d = (
  bodies: readonly Body3d[],
  spacing: number,
): readonly ScenePoint3d[] => {
  const cx = median3d(bodies.map((body) => body.x))
  const cy = median3d(bodies.map((body) => body.y))
  const cz = median3d(bodies.map((body) => body.z))
  const centred = bodies.map((body): ScenePoint3d => [
    body.x - cx,
    body.y - cy,
    body.z - cz,
  ])
  const typical = median3d(nearestDistances3d(centred))
  const scale = typical === 0 ? 0 : spacing / typical
  const scaled = centred.map(([x, y, z]): ScenePoint3d => [
    x * scale,
    y * scale,
    z * scale,
  ])
  const limit = 1.6 * median3d(scaled.map((point) => Math.hypot(...point)))
  return scaled.map(([x, y, z]): ScenePoint3d => {
    const length = Math.hypot(x, y, z)
    const pull = length > limit && limit > 0 ? limit / length : 1
    return [x * pull, y * pull, z * pull]
  })
}
