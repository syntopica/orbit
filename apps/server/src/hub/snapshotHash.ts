import type { Snapshot } from '@orbit/contract'

import { stableSnapshotCore } from './stableSnapshotCore'

/** Hash of a snapshot without the fields that change on every read (spec 5.5). */
export const snapshotHash = (snapshot: Snapshot): string =>
  JSON.stringify({
    ...stableSnapshotCore(snapshot),
    lastGood:
      snapshot.lastGood === null ? null : stableSnapshotCore(snapshot.lastGood),
  })
