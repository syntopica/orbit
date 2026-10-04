import { useSigma } from '@react-sigma/core'
import { useEffect } from 'react'

import { edgeHighlighter } from '../graph/edgeHighlighter'
import { nodeHighlighter } from '../graph/nodeHighlighter'
import type { GraphEdgeAttributes } from '../types/GraphEdgeAttributes'
import type { GraphHighlightProps } from '../types/GraphHighlightProps'
import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'

// Reducers restyle at draw time, so hovering never rebuilds the graph.
export const useGraphHighlight = ({
  graph,
  centre,
  palette,
}: GraphHighlightProps): void => {
  const sigma = useSigma<GraphNodeAttributes, GraphEdgeAttributes>()
  useEffect(() => {
    const active = centre !== null && graph.hasNode(centre)
    sigma.setSetting(
      'nodeReducer',
      active ? nodeHighlighter(graph, centre) : null,
    )
    sigma.setSetting(
      'edgeReducer',
      active ? edgeHighlighter(graph, centre, palette.accent) : null,
    )
  }, [sigma, graph, centre, palette])
}
