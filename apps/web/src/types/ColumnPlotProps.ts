import type { ChartLayout } from './ChartLayout'

export type ColumnPlotProps = {
  readonly layout: ChartLayout
  readonly fills: Readonly<Record<string, string>>
  readonly active: number | null
}
