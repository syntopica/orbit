import type { GraphScene } from '../types/GraphScene'
import type { ScenePoint3d } from '../types/ScenePoint3d'
import { nodeRadius3d } from './nodeRadius3d'

// The radius around the origin that holds every sphere whole, never under 1.
export const sceneExtent3d = (
  scene: GraphScene,
  points: ReadonlyMap<string, ScenePoint3d>,
): number =>
  Math.max(
    1,
    ...scene.nodes.map(
      (node) =>
        Math.hypot(...(points.get(node.id) ?? [0, 0, 0])) +
        nodeRadius3d(node.size),
    ),
  )
