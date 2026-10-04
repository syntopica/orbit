import type { ActionRun } from './ActionRun'

// A run this process started and can still report on.
export type LiveActionRun = ActionRun & {
  readonly state: 'started' | 'succeeded' | 'failed'
}
