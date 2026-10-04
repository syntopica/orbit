import { useCamera } from '@react-sigma/core'
import { useEffect } from 'react'

import type { GraphFocusProps } from '../types/GraphFocusProps'

// Every scene is already the view (a local view or the overview), and sigma
// frames a graph's own extent at the neutral camera, so the camera returns
// there whenever the scene changes.
export const useGraphFocus = ({ graph, animate }: GraphFocusProps): void => {
  const { goto } = useCamera()
  useEffect(() => {
    goto(
      { x: 0.5, y: 0.5, ratio: 1, angle: 0 },
      { duration: animate ? 300 : 0 },
    )
  }, [animate, graph, goto])
}
