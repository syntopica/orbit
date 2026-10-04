import type { EventMessage, OrbitEvent, StreamMessage } from '@orbit/contract'

export const createEventPublisher =
  (deps: {
    events: EventMessage[]
    recentEvents: number
    send: (message: StreamMessage) => void
    nextId: () => number
  }): ((event: OrbitEvent) => void) =>
  (event) => {
    const message: EventMessage = { type: 'event', id: deps.nextId(), event }
    deps.events.push(message)
    deps.events.splice(0, Math.max(0, deps.events.length - deps.recentEvents))
    deps.send(message)
  }
