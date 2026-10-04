import type { ColorMode } from './ColorMode'
import type { GraphDepth } from './GraphDepth'
import type { HistoryRange } from './HistoryRange'
import type { SceneMode } from './SceneMode'

// D11: everything a Brain view needs to be linked again. `cluster` is the
// community opened in the overview; `maxLinks` hides hubs above that degree.
export type BrainSearch = {
  readonly page?: string
  readonly depth: GraphDepth
  readonly color: ColorMode
  readonly orphans: boolean
  readonly hide: readonly string[]
  readonly hideOrphans: boolean
  readonly maxLinks: number | null
  readonly cluster: number | null
  readonly scene: SceneMode
  readonly range: HistoryRange
}
