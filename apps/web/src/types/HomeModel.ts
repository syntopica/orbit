import type { EventMessage } from '@orbit/contract'

import type { CardModel } from './CardModel'
import type { PendingRow } from './PendingRow'

export type HomeModel = {
  readonly cards: readonly CardModel[]
  readonly pending: readonly PendingRow[]
  readonly events: readonly EventMessage[]
  // True once the opening set has ended with `sync`.
  readonly synced: boolean
  readonly isPhone: boolean
  readonly animate: boolean
  readonly now: number
}
