import type { StackRect } from './StackRect'

export type ColumnLayout = {
  readonly x: number
  readonly center: number
  readonly bandX: number
  readonly bandWidth: number
  readonly barWidth: number
  readonly rects: readonly StackRect[]
}
