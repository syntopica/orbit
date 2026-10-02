import type { LabelEntry } from './LabelEntry'
import type { LaunchctlState } from './LaunchctlState'

export type LabelReading = {
  readonly entry: LabelEntry
  readonly loaded: boolean
  readonly state: LaunchctlState | null
}
