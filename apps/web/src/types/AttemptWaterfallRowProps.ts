import type { WorkerJobDetail } from '@orbit/contract'

export type AttemptWaterfallRowProps = {
  readonly attempt: WorkerJobDetail['attemptDetails'][number]
  readonly first: number
  readonly last: number
  readonly span: number
}
