import type { GraphLoaderProps } from './GraphLoaderProps'
import type { GraphPalette } from './GraphPalette'

export type GraphHighlightProps = GraphLoaderProps & {
  readonly centre: string | null
  readonly palette: GraphPalette
}
