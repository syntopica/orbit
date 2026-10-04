import type { BrainSearch } from './BrainSearch'
import type { GraphModel } from './GraphModel'
import type { GraphPalette } from './GraphPalette'
import type { LayoutResult } from './LayoutResult'

export type BrainSceneInput = {
  readonly model: GraphModel | null
  readonly layout: LayoutResult | null
  readonly search: BrainSearch
  readonly palette: GraphPalette
  readonly focus: number | null
}
