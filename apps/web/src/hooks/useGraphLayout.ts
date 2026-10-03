import { useEffect, useState } from 'react'

import { createLayoutWorker } from '../layout/createLayoutWorker'
import { requestLayout } from '../layout/requestLayout'
import type { GraphModel } from '../types/GraphModel'
import type { HeldLayout } from '../types/HeldLayout'
import type { LayoutState } from '../types/LayoutState'

// One layout per graph model; an answer for an older model is ignored.
export const useGraphLayout = (model: GraphModel | null): LayoutState => {
  const [held, setHeld] = useState<HeldLayout | null>(null)
  useEffect(() => {
    if (model === null) return undefined
    let live = true
    const run = async (): Promise<void> => {
      try {
        const layout = await requestLayout(createLayoutWorker, {
          order: model.ids.length,
          edges: model.edges,
          seed: 1,
        })
        if (live) setHeld({ model, state: { layout, failed: false } })
      } catch {
        if (live) setHeld({ model, state: { layout: null, failed: true } })
      }
    }
    void run()
    return () => {
      live = false
    }
  }, [model])
  return held !== null && held.model === model
    ? held.state
    : { layout: null, failed: false }
}
