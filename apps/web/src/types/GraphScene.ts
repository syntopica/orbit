import type { SceneEdge } from './SceneEdge'
import type { SceneNode } from './SceneNode'

// What the canvas draws, in 2D or 3D: never the whole wiki as single pages.
export type GraphScene = {
  readonly nodes: readonly SceneNode[]
  readonly edges: readonly SceneEdge[]
}
