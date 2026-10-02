import type { HistoryRange } from './HistoryRange'
import type { LaunchdRow } from './LaunchdRow'

export type SystemModel = {
  readonly rows: readonly LaunchdRow[] | null
  readonly failed: boolean
  readonly range: HistoryRange
  readonly setRange: (range: HistoryRange) => void
  readonly isPhone: boolean
}
