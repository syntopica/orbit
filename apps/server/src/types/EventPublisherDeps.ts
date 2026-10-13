import type { EventMessage, StreamMessage } from '@orbit/contract'

export type EventPublisherDeps = {
  events: EventMessage[]
  recentEvents: number
  send: (message: StreamMessage) => void
  nextId: () => number
}
