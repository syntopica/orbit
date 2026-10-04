import type { WorkerJob } from '@orbit/contract'

export type RunningJobsState = {
  readonly jobs: readonly WorkerJob[] | null
  readonly failed: boolean
  readonly now: number
}
