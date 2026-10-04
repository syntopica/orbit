import type { WorkerJob } from '@orbit/contract'

export type RunningJobRowProps = {
  readonly job: WorkerJob
  readonly now: number
}
