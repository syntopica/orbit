import type { HistoryRange } from './HistoryRange'
import type { LaunchdRow } from './LaunchdRow'

export type LaunchdRowViewProps = {
  readonly row: LaunchdRow
  readonly range: HistoryRange
}
