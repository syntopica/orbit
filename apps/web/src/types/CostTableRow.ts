import type { CostTotals } from './CostTotals'

export type CostTableRow = CostTotals & {
  readonly provider: string
  readonly queue: string
  readonly succeeded: number
  readonly wallMs: number
}
