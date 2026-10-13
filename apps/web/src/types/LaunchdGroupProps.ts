import type { HistoryRange } from './HistoryRange'
import type { LaunchdRowGroup } from './LaunchdRowGroup'

export type LaunchdGroupProps = {
  readonly group: LaunchdRowGroup
  readonly range: HistoryRange
}
