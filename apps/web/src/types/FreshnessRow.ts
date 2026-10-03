import type { FlowStageState } from '@orbit/contract'

export type FreshnessRow = {
  readonly name: string
  readonly at: number | null
  readonly policyMs: number
  readonly state: FlowStageState
}
