import { useCamera, useSigma } from '@react-sigma/core'
import { useEffect, useRef } from 'react'
import { localCameraState } from '../graph/localCameraState'
import type { GraphEdgeAttributes } from '../types/GraphEdgeAttributes'
import type { GraphFocusProps } from '../types/GraphFocusProps'
import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'

export const useGraphFocus = ({
  id,
  animate,
  depth,
  graph,
}: GraphFocusProps): void => {
  const sigma = useSigma<GraphNodeAttributes, GraphEdgeAttributes>()
  const { goto, gotoNode } = useCamera()
  const wasLocal = useRef(false)
  useEffect(() => {
    const selected = id !== null && graph.hasNode(id)
    const local = selected && depth > 0
    const leavingLocal = wasLocal.current && !local
    wasLocal.current = local
    const options = { duration: animate ? 300 : 0 }
    if (leavingLocal) {
      goto({ x: 0.5, y: 0.5, ratio: 1, angle: 0 }, options)
      return
    }
    if (id === null || !selected) return
    if (depth === 0) {
      gotoNode(id, options)
      return
    }
    const state = localCameraState(sigma)
    if (state !== null) goto(state, options)
  }, [id, animate, depth, graph, sigma, goto, gotoNode])
}
