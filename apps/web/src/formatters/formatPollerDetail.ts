import type { PollerRow } from '@orbit/contract'

import { POLLER_LABELS } from '../labels/pollerLabels'
import { formatDuration } from './formatDuration'

export const formatPollerDetail = (row: PollerRow, now: number): string => {
  const parts = [
    `${POLLER_LABELS.lastSuccess} ${row.lastSuccessAt === null ? POLLER_LABELS.never : `${formatDuration(now - row.lastSuccessAt)} ago`}`,
  ]
  if (row.lastDurationMs !== null)
    parts.push(
      `${POLLER_LABELS.took} ${String(Math.round(row.lastDurationMs))} ms`,
    )
  if (row.failures > 0)
    parts.push(`${String(row.failures)} ${POLLER_LABELS.failedInARow}`)
  if (!row.running && row.nextAt !== null)
    parts.push(`${POLLER_LABELS.next} ${formatDuration(row.nextAt - now)}`)
  return parts.join(' · ')
}
