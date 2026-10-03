import type { GraphModel } from './GraphModel'
import type { LayoutState } from './LayoutState'

// A layout answer kept with the model it was computed for.
export type HeldLayout = {
  readonly model: GraphModel
  readonly state: LayoutState
}
