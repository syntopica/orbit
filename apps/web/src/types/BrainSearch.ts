import type { ColorMode } from './ColorMode'
import type { GraphDepth } from './GraphDepth'
import type { HistoryRange } from './HistoryRange'

// D11: everything a Brain view needs to be linked again.
export type BrainSearch = {
  readonly page?: string
  readonly depth: GraphDepth
  readonly color: ColorMode
  readonly orphans: boolean
  readonly hide: readonly string[]
  readonly range: HistoryRange
}
