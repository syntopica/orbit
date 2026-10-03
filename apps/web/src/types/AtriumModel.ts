import type { AtriumView } from '@orbit/contract'

import type { HistoryRange } from './HistoryRange'
import type { TrendState } from './TrendState'

export type AtriumModel = {
  readonly view: AtriumView | null
  readonly failed: boolean
  readonly staleAgeMs: number | null
  readonly isPhone: boolean
  readonly trend: TrendState
  readonly range: HistoryRange
  readonly setRange: (next: HistoryRange) => void
}
