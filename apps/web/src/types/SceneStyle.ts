import type { GraphModel } from './GraphModel'
import type { GraphPalette } from './GraphPalette'
import type { LayoutResult } from './LayoutResult'

// Everything a scene builder needs besides the pages it draws; `slots` is
// each page's series slot under the current colour mode.
export type SceneStyle = {
  readonly model: GraphModel
  readonly layout: LayoutResult
  readonly palette: GraphPalette
  readonly slots: readonly number[]
  readonly highlightOrphans: boolean
  readonly focus: number | null
}
