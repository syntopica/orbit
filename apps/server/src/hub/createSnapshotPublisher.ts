import type { Snapshot } from '@orbit/contract'

import type { SnapshotPublisherDeps } from '../types/SnapshotPublisherDeps'
import { snapshotHash } from './snapshotHash'
import { withoutEvents } from './withoutEvents'

export const createSnapshotPublisher =
  (deps: SnapshotPublisherDeps): ((snapshot: Snapshot) => void) =>
  (snapshot) => {
    const stored = withoutEvents(snapshot)
    deps.current.set(snapshot.component, stored)
    const hash = snapshotHash(stored)
    const prior = deps.sent.get(snapshot.component)
    if (prior?.hash === hash && Date.now() - prior.at < 30_000) return
    deps.sent.set(snapshot.component, { hash, at: Date.now() })
    deps.send({ type: 'snapshot', id: deps.nextId(), snapshot: stored })
  }
