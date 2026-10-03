import { useGraphLoader } from '../../hooks/useGraphLoader'
import type { GraphLoaderProps } from '../../types/GraphLoaderProps'

export const GraphLoader = (props: GraphLoaderProps) => {
  useGraphLoader(props)
  return null
}
