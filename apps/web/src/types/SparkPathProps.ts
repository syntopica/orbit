import type { TrendPoint } from './TrendPoint'

export type SparkPathProps = {
  readonly points: readonly TrendPoint[]
  readonly active: number | null
  readonly stroke: string
  readonly dot: string
}
