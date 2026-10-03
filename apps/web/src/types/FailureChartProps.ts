import type { FailureChartModel } from './FailureChartModel'

export type FailureChartProps = {
  readonly failures: FailureChartModel
  readonly bucketMs: number
  readonly stale: boolean
}
