import type { BrainRelated } from '@orbit/contract'

export type BrainRelatedState = {
  readonly related: BrainRelated | null
  readonly loading: boolean
  readonly failed: boolean
}
