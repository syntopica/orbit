import type { ColorMode } from './ColorMode'

export type NodeStyleOptions = {
  readonly colorBy: ColorMode
  readonly highlightOrphans: boolean
  readonly selected: number | null
  readonly visible: readonly boolean[]
}
