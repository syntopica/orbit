import type { ScenePoint3d } from '../types/ScenePoint3d'
import { separateSpheres3d } from './separateSpheres3d'

// Separates the spheres, then pulls the centres in when a sphere pokes out of
// `radius`, and separates again: a few rounds settle both, because the
// spheres fill only a small part of the scene's volume.
export const fitSpheres3d = (
  points: readonly ScenePoint3d[],
  radii: readonly number[],
  radius: number,
): readonly ScenePoint3d[] => {
  let placed = separateSpheres3d(points, radii, 60)
  for (let round = 0; round < 12; round += 1) {
    const extent = Math.max(
      0,
      ...placed.map(
        (point, index) => Math.hypot(...point) + (radii[index] ?? 0),
      ),
    )
    if (extent <= radius) break
    const scale = radius / extent
    placed = separateSpheres3d(
      placed.map(([x, y, z]): ScenePoint3d => [
        x * scale,
        y * scale,
        z * scale,
      ]),
      radii,
      60,
    )
  }
  return placed
}
