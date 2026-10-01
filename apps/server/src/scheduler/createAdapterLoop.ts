import type { SnapshotCore } from '@orbit/contract'

import type { Adapter } from '../types/Adapter'
import type { LoopHandle } from '../types/LoopHandle'
import type { SnapshotSink } from '../types/SnapshotSink'
import { backoffDelay } from './backoffDelay'
import { createEmitter } from './createEmitter'
import { downSnapshot } from './downSnapshot'
import { guardedRead } from './guardedRead'
import { reasonOf } from './reasonOf'

export const createAdapterLoop = (
  adapter: Adapter,
  sink: SnapshotSink,
): LoopHandle => {
  const emitter = createEmitter(adapter, sink)
  let stopped = true
  let failures = 0
  let lastGood: SnapshotCore | null = null
  let next: NodeJS.Timeout | undefined
  let controller: AbortController | undefined

  const record = (result: PromiseSettledResult<SnapshotCore>): void => {
    if (result.status === 'fulfilled') {
      lastGood = result.value
      failures = 0
      emitter.emit({ ...result.value, lastGood: null })
      return
    }
    failures += 1
    emitter.emit(downSnapshot(adapter.id, reasonOf(result.reason), lastGood))
  }

  const readOnce = async (): Promise<void> => {
    controller = new AbortController()
    await guardedRead(adapter, emitter, controller, record)
    if (stopped) return
    const delay =
      failures === 0
        ? adapter.cadenceMs
        : backoffDelay(adapter.cadenceMs, failures)
    next = setTimeout(tick, delay)
  }

  const tick = (): void => {
    void readOnce()
  }

  return {
    start: () => {
      stopped = false
      emitter.open()
      tick()
    },
    stop: () => {
      stopped = true
      clearTimeout(next)
      emitter.close()
      controller?.abort()
    },
  }
}
