import type { BrainView } from './BrainView'
import type { SceneMode } from './SceneMode'

export type GraphStageProps = {
  readonly view: BrainView
  readonly select: (id: string | null) => void
  readonly scene: SceneMode
  readonly animate: boolean
}
