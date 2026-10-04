import type { Body3d } from '../types/Body3d'
import type { SceneNode } from '../types/SceneNode'
import { seededRandom } from './seededRandom'

// Each node at its 2D position scaled to the radius the relaxation expects
// for this many nodes, lifted off the plane by a seeded offset so the same
// scene always starts the same way.
export const initialBodies3d = (nodes: readonly SceneNode[]): Body3d[] => {
  const radius = 1.5 * Math.cbrt(Math.max(1, nodes.length))
  const extent = Math.max(
    1e-9,
    ...nodes.map((node) => Math.hypot(node.x, node.y)),
  )
  const random = seededRandom(nodes.length + 1)
  return nodes.map((node) => ({
    x: (node.x / extent) * radius,
    y: (node.y / extent) * radius,
    z: (random() - 0.5) * radius,
    dx: 0,
    dy: 0,
    dz: 0,
  }))
}
