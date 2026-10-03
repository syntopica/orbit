import { epochOrNull } from '../time/epochOrNull'
import type { FreshReader } from '../types/FreshReader'
import type { FreshSource } from '../types/FreshSource'
import { oldestPendingAt } from './oldestPendingAt'

// Where each freshness source finds its instant (D4).
export const FRESH_READERS: Readonly<Record<FreshSource, FreshReader>> = {
  'atrium.archive': (_spec, i) => epochOrNull(i.atrium?.refresh.archive.at),
  'atrium.refresh': (_spec, i) => epochOrNull(i.atrium?.refresh.refresh.at),
  'atrium.content': (_spec, i) => epochOrNull(i.atrium?.refresh.content.at),
  'atrium.synthesis': (_spec, i) =>
    epochOrNull(i.atrium?.synthesis?.lastPass.finishedAt),
  oldest_pending: oldestPendingAt,
  label: (spec, i) => {
    const label = i.labels.get(spec.id)
    return label === undefined ? null : (i.lastRuns.get(label) ?? null)
  },
}
