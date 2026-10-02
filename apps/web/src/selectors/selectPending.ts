import { COMPONENT_IDS } from '@orbit/contract'

import { PENDING_LABELS } from '../labels/pendingLabels'
import type { PendingRow } from '../types/PendingRow'
import type { StreamState } from '../types/StreamState'
import { UNKNOWN_AGE } from './unknownAge'

export const selectPending = (
  snapshots: StreamState['snapshots'],
): PendingRow[] =>
  COMPONENT_IDS.flatMap((component) => {
    const snapshot = snapshots[component]
    const lastGood =
      snapshot?.health.state === 'down' ? snapshot.lastGood : null
    const stale = lastGood !== null
    const items = (lastGood ?? snapshot)?.pending ?? []
    return items
      .filter((item) => item.count > 0)
      .map((item) => ({
        component,
        key: item.key,
        label: PENDING_LABELS[item.key],
        count: item.count,
        oldestAt: item.oldestAt,
        stale,
      }))
  }).sort((a, b) =>
    (a.oldestAt ?? UNKNOWN_AGE).localeCompare(b.oldestAt ?? UNKNOWN_AGE),
  )
