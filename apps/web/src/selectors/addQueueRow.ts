import type { WorkerActivityRow } from '@orbit/contract'

import type { QueueAccumulator } from '../types/QueueAccumulator'
import { addCount } from './addCount'

// Folds one production row into its queue's rollup; `index` is its bucket.
export const addQueueRow = (
  acc: QueueAccumulator,
  row: WorkerActivityRow,
  index: number,
): void => {
  if (row.outcome === 'succeeded') {
    acc.succeeded[index] = (acc.succeeded[index] ?? 0) + row.attempts
  }
  if (row.outcome === 'failed') {
    addCount(acc.errors, row.error ?? 'no code', row.attempts)
  }
  addCount(acc.outcomes, row.outcome, row.attempts)
  addCount(acc.providers, row.provider, row.attempts)
  acc.wallMs += row.wallMs
  acc.attempts += row.attempts
  acc.tokensIn += row.tokensIn
  acc.tokensOut += row.tokensOut
}
