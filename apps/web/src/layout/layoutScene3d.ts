import { SCENE_RADIUS_3D } from '../geometry/sceneRadius3d'
import type { GraphScene } from '../types/GraphScene'
import type { ScenePoint3d } from '../types/ScenePoint3d'
import { attractBodies3d } from './attractBodies3d'
import { bodyPairs3d } from './bodyPairs3d'
import { initialBodies3d } from './initialBodies3d'
import { moveBodies3d } from './moveBodies3d'
import { normalizeBodies3d } from './normalizeBodies3d'
import { relaxationSteps3d } from './relaxationSteps3d'
import { repelBodies3d } from './repelBodies3d'

// A static, deterministic 3D layout of the scene the 2D canvas draws: nodes
// start from their 2D positions and relax with a cooling step. Nothing moves
// once the scene is shown, so reduced motion needs no special case.
export const layoutScene3d = (
  scene: GraphScene,
): ReadonlyMap<string, ScenePoint3d> => {
  const bodies = initialBodies3d(scene.nodes)
  const pairs = bodyPairs3d(scene, bodies)
  const steps = relaxationSteps3d(bodies.length)
  const heat = Math.cbrt(Math.max(1, bodies.length))
  for (let step = 0; step < steps; step += 1) {
    repelBodies3d(bodies)
    attractBodies3d(pairs, bodies)
    moveBodies3d(bodies, heat * (1 - step / steps))
  }
  const placed = normalizeBodies3d(bodies, SCENE_RADIUS_3D)
  return new Map(
    scene.nodes.map((node, index) => [node.id, placed[index] ?? [0, 0, 0]]),
  )
}
