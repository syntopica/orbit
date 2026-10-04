import type { WorkerJob } from '@orbit/contract'

export type WorkerJobsTableRowProps = {
  readonly job: WorkerJob
  readonly showCost: boolean
}
