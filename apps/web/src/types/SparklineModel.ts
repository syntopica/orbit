import type { ColumnFocus } from './ColumnFocus'
import type { SparkPoint } from './SparkPoint'

export type SparklineModel = {
  readonly parentRef: (node: HTMLDivElement | null) => void
  readonly width: number
  readonly step: number
  readonly points: readonly SparkPoint[]
  readonly focus: ColumnFocus
}
