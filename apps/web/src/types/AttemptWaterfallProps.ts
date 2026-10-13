import type { WorkerJobDetail } from '@orbit/contract'

export type AttemptWaterfallProps = {
  readonly attempts: WorkerJobDetail['attemptDetails']
}
