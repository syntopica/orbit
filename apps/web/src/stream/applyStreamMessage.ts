import type { StreamMessage } from '@orbit/contract'

import type { StreamState } from '../types/StreamState'

export const applyStreamMessage = (
  state: StreamState,
  message: StreamMessage,
): StreamState => {
  switch (message.type) {
    case 'resync':
      return { snapshots: {}, events: [], lastId: message.id, synced: false }
    case 'snapshot':
      return {
        ...state,
        lastId: message.id,
        snapshots: {
          ...state.snapshots,
          [message.snapshot.component]: message.snapshot,
        },
      }
    case 'event':
      return {
        ...state,
        lastId: message.id,
        events: [message, ...state.events].slice(0, 50),
      }
    case 'sync':
      return { ...state, lastId: message.id, synced: true }
  }
}
