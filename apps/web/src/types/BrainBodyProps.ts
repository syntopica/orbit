import type { BrainSearchModel } from './BrainSearchModel'
import type { BrainView } from './BrainView'

export type BrainBodyProps = {
  readonly view: BrainView
  readonly brain: BrainSearchModel
}
