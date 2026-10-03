import type { HistoryRange } from './HistoryRange'
import type { TrendState } from './TrendState'

export type TrendSectionProps = {
  readonly title: string
  readonly chartLabel: string
  readonly trend: TrendState
  readonly range: HistoryRange
  readonly setRange: (next: HistoryRange) => void
}
