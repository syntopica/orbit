import type { TrendModel } from './TrendModel'

export type TrendState = {
  readonly model: TrendModel | null
  readonly stale: boolean
  readonly failed: boolean
}
