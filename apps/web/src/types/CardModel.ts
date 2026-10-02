import type { ComponentId } from '@orbit/contract'

import type { CardState } from './CardState'

export type CardModel = {
  readonly component: ComponentId
  readonly label: string
  readonly state: CardState
  readonly reason: string | null
  readonly headline: string | null
  readonly observedAt: string
  readonly greyed: boolean
}
