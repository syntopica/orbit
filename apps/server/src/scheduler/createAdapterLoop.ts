import type { Adapter } from '../types/Adapter'
import type { LoopHandle } from '../types/LoopHandle'
import type { SnapshotSink } from '../types/SnapshotSink'
import { backoffDelay } from './backoffDelay'
import { createEmitter } from './createEmitter'
import { createRecorder } from './createRecorder'
import { guardedRead } from './guardedRead'

export const createAdapterLoop = (
  adapter: Adapter,
  sink: SnapshotSink,
): LoopHandle => {
  const emitter = createEmitter(adapter, sink)
  const recorder = createRecorder(adapter, emitter)
  let running = false
  let generation = 0
  let next: NodeJS.Timeout | undefined
  let controller: AbortController | undefined
  let inflight: Promise<void> = Promise.resolve()

  const current = (own: number): boolean => running && own === generation

  const readOnce = async (own: number): Promise<void> => {
    controller = new AbortController()
    await guardedRead(adapter, emitter, controller, (result) => {
      if (current(own)) recorder.record(result)
    })
    if (!current(own)) return
    const delay =
      recorder.failures() === 0
        ? adapter.cadenceMs
        : backoffDelay(adapter.cadenceMs, recorder.failures())
    next = setTimeout(() => {
      tick(own)
    }, delay)
  }

  const tick = (own: number): void => {
    inflight = readOnce(own)
  }

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
