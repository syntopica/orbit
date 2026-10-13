import { useSigma } from '@react-sigma/core'
import { useEffect } from 'react'

import type { GraphEdgeAttributes } from '../types/GraphEdgeAttributes'
import type { GraphHighlightProps } from '../types/GraphHighlightProps'
import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'

// The reducers restyle from sigma state at draw time, so hovering marks the
// centre, its neighbours and its edges as highlighted instead of rebuilding
// the graph.
export const useGraphHighlight = ({
  graph,
  centre,
}: GraphHighlightProps): void => {
  const sigma = useSigma<GraphNodeAttributes, GraphEdgeAttributes>()
  useEffect(() => {
    if (centre === null || !graph.hasNode(centre)) return
    const nodes = [centre, ...graph.neighbors(centre)]
    const edges = graph.edges(centre)
    sigma.setNodesState(nodes, { isHighlighted: true })
    sigma.setEdgesState(edges, { isHighlighted: true })
    return () => {
      sigma.setNodesState(nodes, { isHighlighted: false })
      sigma.setEdgesState(edges, { isHighlighted: false })
    }
  }, [sigma, graph, centre])
}
