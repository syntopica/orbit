import type { ComponentId, Snapshot, StreamMessage } from '@orbit/contract'

import { snapshotHash } from './snapshotHash'
import { withoutEvents } from './withoutEvents'

export const createSnapshotPublisher =
  (deps: {
    current: Map<ComponentId, Snapshot>
    sent: Map<ComponentId, { hash: string; at: number }>
    send: (message: StreamMessage) => void
    nextId: () => number
  }): ((snapshot: Snapshot) => void) =>
  (snapshot) => {
    const stored = withoutEvents(snapshot)
    deps.current.set(snapshot.component, stored)
    const hash = snapshotHash(stored)
    const prior = deps.sent.get(snapshot.component)
    if (prior?.hash === hash && Date.now() - prior.at < 30_000) return
    deps.sent.set(snapshot.component, { hash, at: Date.now() })
    deps.send({ type: 'snapshot', id: deps.nextId(), snapshot: stored })
  }
