import type { Ref } from 'react'
import type { CardModel } from './CardModel'

export type OrbitLabelProps = {
  readonly card: CardModel
  readonly index: number
  readonly now: number
  readonly ref: Ref<HTMLAnchorElement>
}
