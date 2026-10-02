import type {
  ComponentId,
  OrbitEvent,
  Snapshot,
  StreamMessage,
} from '@orbit/contract'

import type { Hub } from '../types/Hub'
import { createRing } from './createRing'
import { deliverToListeners } from './deliverToListeners'

export const createHub = (options: {
  ringSize: number
  recentEvents: number
  firstId: number
}): Hub => {
  const resendMs = 30_000
  let nextId = options.firstId
  const ring = createRing(options.ringSize)
  const current = new Map<ComponentId, Snapshot>()
  const sent = new Map<ComponentId, { hash: string; at: number }>()
  const events: OrbitEvent[] = []
  const listeners = new Set<(message: StreamMessage) => void>()
  const send = (message: StreamMessage): void => {
    ring.push(message)
    deliverToListeners(listeners, message)
  }
  const publishSnapshot = (snapshot: Snapshot): void => {
    const stored = { ...snapshot, events: [] }
    current.set(snapshot.component, stored)
    const hash = JSON.stringify({ ...stored, observedAt: '' })
    const prior = sent.get(snapshot.component)
    if (prior?.hash === hash && Date.now() - prior.at < resendMs) return
    sent.set(snapshot.component, { hash, at: Date.now() })
    send({ type: 'snapshot', id: nextId++, snapshot: stored })
  }
  return {
    ringSize: options.ringSize,
    publish: (snapshot) => {
      publishSnapshot(snapshot)
      for (const event of snapshot.events) {
        events.push(event)
        events.splice(0, Math.max(0, events.length - options.recentEvents))
        send({ type: 'event', id: nextId++, event })
      }
    },
    snapshots: () => [...current.values()],
    recentEvents: () => [...events],
    lastId: () => nextId - 1,
    replayAfter: (id) => ring.after(id),
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
