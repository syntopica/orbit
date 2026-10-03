import { useGraphFocus } from '../../hooks/useGraphFocus'
import type { GraphFocusProps } from '../../types/GraphFocusProps'

export const GraphFocus = (props: GraphFocusProps) => {
  useGraphFocus(props)
  return null
}
