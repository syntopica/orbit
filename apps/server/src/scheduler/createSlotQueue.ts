import { ProcessError } from '../process/ProcessError'
import type { SlotQueue } from '../types/SlotQueue'

// FIFO slots: a waiter whose signal aborts is refused with `timeout` at once
// and skipped when a slot frees; one that starts drops its abort listener.
export const createSlotQueue = (slots: number): SlotQueue => {
  let running = 0
  const waiting: {
    readonly signal: AbortSignal
    readonly start: () => void
  }[] = []
  return {
    acquire: async (signal) => {
      if (running < slots) {
        running += 1
        return
      }
      await new Promise<void>((resolve, reject) => {
        const onAbort = (): void => {
          reject(new ProcessError('timeout'))
        }
        const start = (): void => {
          signal.removeEventListener('abort', onAbort)
          running += 1
          resolve()
        }
        waiting.push({ signal, start })
        signal.addEventListener('abort', onAbort, { once: true })
      })
    },
    release: () => {
      running -= 1
      let next = waiting.shift()
      while (next?.signal.aborted === true) next = waiting.shift()
      next?.start()
    },
  }
}
