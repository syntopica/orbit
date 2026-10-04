import type {
  ComponentId,
  EventMessage,
  Snapshot,
  StreamMessage,
} from '@orbit/contract'

import type { Hub } from '../types/Hub'
import { createEventPublisher } from './createEventPublisher'
import { createRing } from './createRing'
import { createSnapshotPublisher } from './createSnapshotPublisher'
import { deliverToListeners } from './deliverToListeners'

export const createHub = (options: {
  ringSize: number
  recentEvents: number
  firstId: number
}): Hub => {
  if (!Number.isInteger(options.ringSize) || options.ringSize < 1)
    throw new Error('ringSize must be a positive integer')
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
  const publishEvent = createEventPublisher({
    events,
    recentEvents: options.recentEvents,
    send,
    nextId: () => nextId++,
  })
  const publishSnapshot = createSnapshotPublisher({
    current,
    sent,
    send,
    nextId: () => nextId++,
  })
  return {
    ringSize: options.ringSize,
    publishEvent,
    publish: (snapshot) => {
      publishSnapshot(snapshot)
      for (const event of snapshot.events) publishEvent(event)
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
