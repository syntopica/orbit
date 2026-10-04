import type { Adapter } from '../types/Adapter'
import type { LoopHandle } from '../types/LoopHandle'
import type { PollTracker } from '../types/PollTracker'
import type { SnapshotSink } from '../types/SnapshotSink'
import { backoffDelay } from './backoffDelay'
import { createEmitter } from './createEmitter'
import { createRecorder } from './createRecorder'
import { guardedRead } from './guardedRead'
import { noopTracker } from './noopTracker'

export const createAdapterLoop = (
  adapter: Adapter,
  sink: SnapshotSink,
  track: PollTracker = noopTracker,
): LoopHandle => {
  const emitter = createEmitter(adapter, sink)
  const recorder = createRecorder(adapter, emitter, track)
  let running = false
  let generation = 0
  let next: NodeJS.Timeout | undefined
  let controller: AbortController | undefined
  let inflight: Promise<void> = Promise.resolve()
  const current = (own: number): boolean => running && own === generation
  const readOnce = async (own: number): Promise<void> => {
    controller = new AbortController()
    track.attempt()
    try {
      await guardedRead(adapter, emitter, controller, (result) => {
        if (current(own)) recorder.record(result)
      })
    } catch {
      return
    }
    if (!current(own)) return
    const delay = backoffDelay(adapter.cadenceMs, recorder.failures())
    track.scheduled(delay)
    next = setTimeout(tick, delay, own)
  }

  const tick = (own: number): void => void (inflight = readOnce(own))

  const begin = async (own: number): Promise<void> => {
    await inflight
    if (current(own)) tick(own)
  }

  return {
    start: () => {
      if (running) return
      running = true
      generation += 1
      recorder.reset()
      emitter.open()
      void begin(generation)
    },
    stop: () => {
      running = false
      clearTimeout(next)
      emitter.close()
      controller?.abort()
    },
  }
}
