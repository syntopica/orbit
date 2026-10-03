import type { AtriumView } from '@orbit/contract'

import { ATRIUM_LABELS } from '../labels/atriumLabels'
import type { FreshnessRow } from '../types/FreshnessRow'
import { freshnessState } from './freshnessState'

// Archive and refresh against 2 x the refresh interval (spec 3.1); newest
// content against 3 days (spec 7.4).
export const selectFreshnessRows = (view: AtriumView): FreshnessRow[] => {
  const twice = 2 * view.refreshIntervalMs
  return [
    { name: ATRIUM_LABELS.archive, at: view.archiveAt, policyMs: twice },
    { name: ATRIUM_LABELS.refresh, at: view.refreshAt, policyMs: twice },
    { name: ATRIUM_LABELS.content, at: view.contentAt, policyMs: 259_200_000 },
  ].map((row) => ({
    ...row,
    state: freshnessState(row.at, row.policyMs, view.now),
  }))
}
