import type { EventMessage, OrbitEvent } from '@orbit/contract'
import type { EventPublisherDeps } from '../types/EventPublisherDeps'

export const createEventPublisher =
  (deps: EventPublisherDeps): ((event: OrbitEvent) => void) =>
  (event) => {
    const message: EventMessage = { type: 'event', id: deps.nextId(), event }
    deps.events.push(message)
    deps.events.splice(0, Math.max(0, deps.events.length - deps.recentEvents))
    deps.send(message)
  }
