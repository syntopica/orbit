import type { EventMessage, OrbitEvent } from '@orbit/contract'

// Wraps events, newest first, as stream messages with distinct ids.
export const eventMessages = (events: readonly OrbitEvent[]): EventMessage[] =>
  events.map((event, index) => ({
    type: 'event',
    id: events.length - index,
    event,
  }))
