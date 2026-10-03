import type { TrendLine } from './TrendLine'

export type TrendModel = {
  readonly starts: readonly number[]
  readonly bucketMs: number
  readonly lines: readonly TrendLine[]
}
