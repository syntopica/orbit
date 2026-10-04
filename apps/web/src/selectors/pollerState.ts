import type { PollerRow } from '@orbit/contract'

import { POLLER_OVERDUE_MS } from '../labels/pollerOverdueMs'
import type { PollerLine } from '../types/PollerLine'

export const pollerState = (
  row: PollerRow,
  now: number,
): PollerLine['state'] => {
  if (row.running) return 'reading'
  if (row.lastAttemptAt === null) return 'waiting'
  if (row.nextAt !== null && now - row.nextAt > POLLER_OVERDUE_MS)
    return 'overdue'
  return row.failures > 0 ? 'failing' : 'ok'
}
