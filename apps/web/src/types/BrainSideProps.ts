import type { BrainSearchModel } from './BrainSearchModel'
import type { GraphModel } from './GraphModel'

export type BrainSideProps = {
  readonly brain: BrainSearchModel
  readonly model: GraphModel | null
}
