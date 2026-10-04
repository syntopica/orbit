import type { GraphPalette } from './GraphPalette'
import type { GraphScene } from './GraphScene'
import type { ScenePoint3d } from './ScenePoint3d'

// What every part of the 3D scene draws from; `hovered` is the node under
// the pointer, whose neighbours stay lit while the rest dims.
export type Scene3dPartProps = {
  readonly scene: GraphScene
  readonly points: ReadonlyMap<string, ScenePoint3d>
  readonly palette: GraphPalette
  readonly lit: ReadonlySet<string> | null
}
