import type { ActionRun } from './ActionRun'
import type { RunResult } from './RunResult'

export type ActionStore = {
  start(input: {
    kind: string
    target: string
    component: 'launchd' | 'brain' | 'clips'
    key: string
    run: (signal: AbortSignal) => Promise<RunResult>
  }): { run: ActionRun } | { startedAt: number }
  list(): readonly ActionRun[]
  stop(): void
}
