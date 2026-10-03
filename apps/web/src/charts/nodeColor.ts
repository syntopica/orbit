import type { GraphPalette } from '../types/GraphPalette'
import type { NodeColorInput } from '../types/NodeColorInput'

// Selection wins, then the orphan highlight (a state: the warn colour, always
// named in the legend), then the node's series slot.
export const nodeColor = (
  input: NodeColorInput,
  palette: GraphPalette,
): string => {
  if (input.selected) return palette.accent
  if (input.orphan && input.highlightOrphans) return palette.warn
  return palette.series[input.slot - 1] ?? palette.series[5] ?? palette.line
}
