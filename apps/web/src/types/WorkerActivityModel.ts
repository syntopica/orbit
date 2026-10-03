import type { ActivityColumn } from './ActivityColumn'
import type { FailureChartModel } from './FailureChartModel'
import type { OpenrouterToday } from './OpenrouterToday'
import type { QueueActivity } from './QueueActivity'

export type WorkerActivityModel = {
  readonly starts: readonly number[]
  readonly bucketMs: number
  readonly columns: readonly ActivityColumn[]
  readonly series: readonly string[]
  readonly queues: ReadonlyMap<string, QueueActivity>
  readonly failures: FailureChartModel
  readonly openrouter: OpenrouterToday
}
