import type { ActionRun } from './ActionRun'

export type ActionRunRow = {
  readonly id: string
  readonly kind: string
  readonly target: string
  readonly state: ActionRun['state']
  readonly started_at: number
  readonly exit_code: number
  readonly duration_ms: number
}
