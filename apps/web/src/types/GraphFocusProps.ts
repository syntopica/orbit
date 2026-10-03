import type { GraphDepth } from './GraphDepth'
import type { GraphLoaderProps } from './GraphLoaderProps'

export type GraphFocusProps = GraphLoaderProps & {
  readonly id: string | null
  readonly animate: boolean
  readonly depth: GraphDepth
}
