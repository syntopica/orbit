import type { BrainSearchModel } from './BrainSearchModel'
import type { GraphModel } from './GraphModel'

export type GraphControlsProps = {
  readonly model: GraphModel
  readonly brain: BrainSearchModel
}
