import type { StreamMessage } from './StreamMessage'

export type EventMessage = Extract<StreamMessage, { type: 'event' }>
