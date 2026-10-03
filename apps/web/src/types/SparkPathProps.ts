import type { SparkPoint } from './SparkPoint'

export type SparkPathProps = {
  readonly points: readonly SparkPoint[]
  readonly active: number | null
  readonly stroke: string
  readonly dot: string
}
