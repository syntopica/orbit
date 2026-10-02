import type { DetailPool } from '../types/DetailPool'
import { afterSettled } from './afterSettled'
import { createSlotQueue } from './createSlotQueue'
import { raceAbort } from './raceAbort'
import { startWork } from './startWork'

// Pool for request-triggered work (spec 5.2). The timeout counts from enqueue;
// at the deadline the caller gets `timeout` at once, but the slot stays taken
// until the work really settles, so a stuck job cannot multiply.
export const createDetailPool = (slots: number): DetailPool => {
  const queue = createSlotQueue(slots)
  return {
    run: async (work, timeoutMs) => {
      const controller = new AbortController()
      const timer = setTimeout(() => {
        controller.abort()
      }, timeoutMs)
      try {
        await queue.acquire(controller.signal)
      } catch (error) {
        clearTimeout(timer)
        throw error
      }
      const job = startWork(work, controller.signal)
      void afterSettled(job, () => {
        clearTimeout(timer)
        queue.release()
      })
      return raceAbort(job, controller.signal)
    },
  }
}
