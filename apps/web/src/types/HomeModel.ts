import type { OrbitEvent } from '@orbit/contract'

import type { CardModel } from './CardModel'
import type { PendingRow } from './PendingRow'

export type HomeModel = {
  readonly cards: readonly CardModel[]
  readonly pending: readonly PendingRow[]
  readonly events: readonly OrbitEvent[]
  readonly isPhone: boolean
  readonly animate: boolean
  readonly now: number
}
