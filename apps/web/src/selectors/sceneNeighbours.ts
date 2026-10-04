import type { GraphScene } from '../types/GraphScene'

// Each node's directly linked nodes in the scene.
export const sceneNeighbours = (
  scene: GraphScene,
): ReadonlyMap<string, ReadonlySet<string>> => {
  const neighbours = new Map<string, Set<string>>(
    scene.nodes.map((node) => [node.id, new Set()]),
  )
  for (const { source, target } of scene.edges) {
    neighbours.get(source)?.add(target)
    neighbours.get(target)?.add(source)
  }
  return neighbours
}
