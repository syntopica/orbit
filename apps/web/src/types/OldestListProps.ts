import type { ClipsView } from '@orbit/contract'

export type OldestListProps = {
  readonly states: ClipsView['states']
  readonly now: number
}
