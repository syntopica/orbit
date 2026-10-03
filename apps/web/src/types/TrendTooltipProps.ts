import type { TrendLine } from './TrendLine'

export type TrendTooltipProps = {
  readonly lines: readonly TrendLine[]
  readonly index: number
  readonly when: string
}
