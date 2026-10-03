import type { BrainRelated } from '@orbit/contract'
import type { RelatedPanelProps } from './RelatedPanelProps'

export type RelatedListProps = RelatedPanelProps & {
  readonly related: BrainRelated
}
