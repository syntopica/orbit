import type { GraphPalette } from './GraphPalette'
import type { GraphScene } from './GraphScene'

export type GraphScene3dProps = {
  readonly scene: GraphScene
  readonly palette: GraphPalette
  readonly onSelect: (id: string | null) => void
}
