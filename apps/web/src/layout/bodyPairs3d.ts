import type { Body3d } from '../types/Body3d'
import type { BodyPair3d } from '../types/BodyPair3d'
import type { GraphScene } from '../types/GraphScene'

// The scene's edges as pairs of bodies; an edge to a missing node is dropped.
export const bodyPairs3d = (
  scene: GraphScene,
  bodies: readonly Body3d[],
): readonly BodyPair3d[] => {
  const byId = new Map(
    scene.nodes.flatMap((node, index): [string, Body3d][] => {
      const body = bodies[index]
      return body === undefined ? [] : [[node.id, body]]
    }),
  )
  return scene.edges.flatMap((edge): BodyPair3d[] => {
    const a = byId.get(edge.source)
    const b = byId.get(edge.target)
    return a === undefined || b === undefined ? [] : [[a, b]]
  })
}
