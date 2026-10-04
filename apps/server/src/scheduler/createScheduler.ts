import type { Adapter } from '../types/Adapter'
import type { LoopHandle } from '../types/LoopHandle'
import type { PollerRegistry } from '../types/PollerRegistry'
import type { SnapshotSink } from '../types/SnapshotSink'
import { createAdapterLoop } from './createAdapterLoop'

export const createScheduler = (
  adapters: readonly Adapter[],
  sink: SnapshotSink,
  poller?: PollerRegistry,
): LoopHandle => {
  const loops = adapters.map((adapter) =>
    createAdapterLoop(adapter, sink, poller?.tracker(adapter.id)),
  )
  return {
    start: () => {
      loops.forEach((loop) => {
        loop.start()
      })
    },
    stop: () => {
      loops.forEach((loop) => {
        loop.stop()
      })
    },
  }
}
