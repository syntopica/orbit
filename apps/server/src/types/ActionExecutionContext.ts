import type { ActionRun } from './ActionRun'
import type { Hub } from './Hub'

export type ActionExecutionContext = {
  readonly history: ActionRun[]
  readonly active: Map<
    string,
    { startedAt: number; controller: AbortController }
  >
  readonly hub: Hub
  readonly now: () => number
}
