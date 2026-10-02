import type { WorkerFailure } from '@orbit/contract'

export type FailureGroup = {
  readonly latest: WorkerFailure
  readonly count: number
}
