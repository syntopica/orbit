import { useLoadGraph } from '@react-sigma/core'
import { useEffect } from 'react'
import type { GraphEdgeAttributes } from '../types/GraphEdgeAttributes'
import type { GraphLoaderProps } from '../types/GraphLoaderProps'
import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'

export const useGraphLoader = ({ graph }: GraphLoaderProps): void => {
  const loadGraph = useLoadGraph<GraphNodeAttributes, GraphEdgeAttributes>()
  useEffect(() => {
    loadGraph(graph)
  }, [graph, loadGraph])
}
