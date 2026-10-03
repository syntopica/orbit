import type { ColorMode } from './ColorMode'
import type { GraphModel } from './GraphModel'

export type GraphLegendProps = {
  readonly model: GraphModel
  readonly colorBy: ColorMode
  readonly communities: number
  readonly highlightOrphans: boolean
}
