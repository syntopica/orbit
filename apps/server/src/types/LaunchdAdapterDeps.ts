import type { LabelEntry } from './LabelEntry'
import type { LaunchdObservation } from './LaunchdObservation'
import type { RunRequest } from './RunRequest'
import type { RunResult } from './RunResult'

export type LaunchdAdapterDeps = {
  readonly launchctl: string
  readonly plutil: string
  readonly labels: readonly LabelEntry[]
  readonly uid: number
  readonly cadenceMs: number
  readonly run: (request: RunRequest) => Promise<RunResult>
  readonly record: (observation: LaunchdObservation) => void
}
