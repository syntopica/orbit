import type {
  ComponentId,
  EventMessage,
  Snapshot,
  StreamMessage,
} from '@orbit/contract'

import type { Hub } from '../types/Hub'
import { createRing } from './createRing'
import { deliverToListeners } from './deliverToListeners'
import { snapshotHash } from './snapshotHash'
import { withoutEvents } from './withoutEvents'

export const createHub = (options: {
  ringSize: number
  recentEvents: number
  firstId: number
}): Hub => {
  if (!Number.isInteger(options.ringSize) || options.ringSize < 1)
    throw new Error('ringSize must be a positive integer')
  const resendMs = 30_000
  let nextId = options.firstId
  const ring = createRing(options.ringSize)
  const current = new Map<ComponentId, Snapshot>()
  const sent = new Map<ComponentId, { hash: string; at: number }>()
  const events: EventMessage[] = []
  const listeners = new Set<(message: StreamMessage) => void>()
  const send = (message: StreamMessage): void => {
    ring.push(message)
    deliverToListeners(listeners, message)
  }
  const publishSnapshot = (snapshot: Snapshot): void => {
    const stored = withoutEvents(snapshot)
    current.set(snapshot.component, stored)
    const hash = snapshotHash(stored)
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
        const message: EventMessage = { type: 'event', id: nextId++, event }
        events.push(message)
        events.splice(0, Math.max(0, events.length - options.recentEvents))
        send(message)
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
