import type { WorkerJobDetail } from '@orbit/contract'

export type WorkerJobActionsProps = {
  readonly job: WorkerJobDetail
  readonly onAction: () => void
}
