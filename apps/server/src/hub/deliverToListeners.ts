import type { StreamMessage } from '@orbit/contract'

export const deliverToListeners = (
  listeners: ReadonlySet<(message: StreamMessage) => void>,
  message: StreamMessage,
): void => {
  // A listener added during delivery starts with the next message.
  for (const listener of Array.from(listeners)) {
    try {
      listener(message)
    } catch {
      // a failing subscriber must not affect the others or the hub state
    }
  }
}
