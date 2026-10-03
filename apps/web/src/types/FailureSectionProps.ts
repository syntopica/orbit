import type { FailureGroup } from './FailureGroup'
import type { WorkerActivityState } from './WorkerActivityState'

export type FailureSectionProps = {
  readonly groups: readonly FailureGroup[]
  readonly activity: WorkerActivityState
}
