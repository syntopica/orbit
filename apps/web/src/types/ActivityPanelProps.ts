import type { WorkerActivityModel } from './WorkerActivityModel'

export type ActivityPanelProps = {
  readonly model: WorkerActivityModel
  readonly stale: boolean
}
