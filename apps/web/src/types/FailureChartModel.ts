import type { StackColumn } from './StackColumn'

export type FailureChartModel = {
  readonly keys: readonly string[]
  readonly columns: readonly StackColumn[]
}
