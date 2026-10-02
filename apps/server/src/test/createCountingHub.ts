import { createHub } from '../hub/createHub'
import type { Hub } from '../types/Hub'

// A real hub whose `active` set holds one entry per live subscription.
export const createCountingHub = (ringSize = 10) => {
  const hub = createHub({ ringSize, recentEvents: 5, firstId: 1 })
  const active = new Set<object>()
  const counted: Hub = {
    ...hub,
    subscribe: (listener) => {
      const token = {}
      active.add(token)
      const unsubscribe = hub.subscribe(listener)
      return () => {
        active.delete(token)
        unsubscribe()
      }
    },
  }
  return { hub: counted, active }
}
