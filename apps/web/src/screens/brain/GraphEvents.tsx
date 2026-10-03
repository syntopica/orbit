import { useGraphEvents } from '../../hooks/useGraphEvents'
import type { GraphEventsProps } from '../../types/GraphEventsProps'

export const GraphEvents = (props: GraphEventsProps) => {
  useGraphEvents(props)
  return null
}
