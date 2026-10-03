import type { AxisTick } from './AxisTick'
import type { ChartFrame } from './ChartFrame'
import type { ColumnLayout } from './ColumnLayout'

export type ChartLayout = {
  readonly frame: ChartFrame
  readonly columns: readonly ColumnLayout[]
  readonly yTicks: readonly AxisTick[]
  readonly xTicks: readonly AxisTick[]
}
