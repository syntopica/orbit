import type { OrbitEvent } from '@orbit/contract'

import { TICKER_FOLD_WINDOW_MS } from './tickerFoldWindowMs'

// How long a job ran, when `stopped` and the older `started` are one run.
export const ranBetween = (
  stopped: OrbitEvent,
  started: OrbitEvent | undefined,
): number | null => {
  if (stopped.kind !== 'launchd.stopped' || started?.kind !== 'launchd.started')
    return null
  if (stopped.refs['label'] !== started.refs['label']) return null
  const ms = Date.parse(stopped.at) - Date.parse(started.at)
  return ms >= 0 && ms <= TICKER_FOLD_WINDOW_MS ? ms : null
}
