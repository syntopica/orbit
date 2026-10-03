import type { BrainView } from './BrainView'
import type { GraphDepth } from './GraphDepth'

export type GraphStageProps = {
  readonly view: BrainView
  readonly selectedId: string | null
  readonly select: (id: string | null) => void
  readonly depth: GraphDepth
  readonly animate: boolean
}
