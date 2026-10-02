import type { CardModel } from './CardModel'

export type ComponentListProps = {
  readonly cards: readonly CardModel[]
  readonly now: number
}
