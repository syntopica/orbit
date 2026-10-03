import type { ChartLayout } from './ChartLayout'
import type { ColumnFocus } from './ColumnFocus'

export type StackedColumnsModel = {
  readonly parentRef: (node: HTMLDivElement | null) => void
  readonly layout: ChartLayout
  readonly focus: ColumnFocus
}
