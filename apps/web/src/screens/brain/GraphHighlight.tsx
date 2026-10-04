import { useGraphHighlight } from '../../hooks/useGraphHighlight'
import type { GraphHighlightProps } from '../../types/GraphHighlightProps'

export const GraphHighlight = (props: GraphHighlightProps) => {
  useGraphHighlight(props)
  return null
}
