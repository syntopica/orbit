import type { BrainSearch } from '../types/BrainSearch'
import type { GraphModel } from '../types/GraphModel'
import type { NodeStyleOptions } from '../types/NodeStyleOptions'
import { visibleNodes } from './visibleNodes'

export const selectNodeStyle = (
  model: GraphModel,
  search: BrainSearch,
  selected: number | null,
): NodeStyleOptions => ({
  colorBy: search.color,
  highlightOrphans: search.orphans,
  selected,
  visible: visibleNodes(model, search.hide, selected, search.depth),
})
