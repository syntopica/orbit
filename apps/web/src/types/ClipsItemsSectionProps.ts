import type { ClipsView } from '@orbit/contract'

export type ClipsItemsSectionProps = {
  readonly items: ClipsView['items']
  readonly now: number
}
