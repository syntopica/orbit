import type { Snapshot } from '@orbit/contract'

import type { Adapter } from '../types/Adapter'
import type { Emitter } from '../types/Emitter'
import type { SnapshotSink } from '../types/SnapshotSink'
import { degradeSnapshot } from './degradeSnapshot'
import { transitionEvent } from './transitionEvent'

export const createEmitter = (
  adapter: Adapter,
  sink: SnapshotSink,
): Emitter => {
  let closed = true
  let last: Snapshot | null = null
  let stale: NodeJS.Timeout | undefined
  let staled = false

  const degrade = (reason: 'lagging' | 'stale'): void => {
    if (closed || last === null || last.health.state === 'down') return
    if (reason === 'lagging' && staled) return
    staled = reason === 'stale'
    sink.publish(degradeSnapshot(last, reason))
  }

  return {
    open: () => {
      closed = false
    },
    close: () => {
      closed = true
      clearTimeout(stale)
    },
    degrade,
    emit: (snapshot) => {
      if (closed) return
      const change = transitionEvent(last?.health ?? null, snapshot)
      last = snapshot
      staled = false
      sink.publish(
        change === null
          ? snapshot
          : { ...snapshot, events: [...snapshot.events, change] },
      )
      clearTimeout(stale)
      stale = setTimeout(() => {
        degrade('stale')
      }, adapter.freshnessMs)
    },
  }
}
