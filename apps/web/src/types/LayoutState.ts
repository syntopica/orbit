import type { LayoutResult } from './LayoutResult'

export type LayoutState = {
  readonly layout: LayoutResult | null
  readonly failed: boolean
}
