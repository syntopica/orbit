import type { BrainSearch } from '../types/BrainSearch'
import type { GraphScene } from '../types/GraphScene'
import type { SceneStyle } from '../types/SceneStyle'
import { egoScene } from './egoScene'
import { filterPages } from './filterPages'
import { overviewScene } from './overviewScene'

// Depth 0 is the clustered overview; 1-3 the local view around the focus.
export const selectBrainScene = (
  style: SceneStyle,
  search: BrainSearch,
): GraphScene => {
  const allowed = filterPages(style.model, search, style.focus)
  return search.depth === 0
    ? overviewScene(style, allowed, search.cluster)
    : egoScene(style, allowed, search.depth)
}
