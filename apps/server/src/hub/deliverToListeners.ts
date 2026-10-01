import type { StreamMessage } from '@orbit/contract'

export const deliverToListeners = (
  listeners: ReadonlySet<(message: StreamMessage) => void>,
  message: StreamMessage,
): void => {
  for (const listener of listeners) {
    try {
      listener(message)
    } catch {
      // a failing subscriber must not affect the others or the hub state
    }
  }
}
