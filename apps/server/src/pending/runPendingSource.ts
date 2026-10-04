import type { PendingView } from '@orbit/contract'

import type { DetailPool } from '../types/DetailPool'
import type { PendingSourceResult } from '../types/PendingSourceResult'
import { unavailableSource } from './unavailableSource'

export const runPendingSource = async (
  pool: DetailPool,
  read: (
    signal: AbortSignal,
  ) => PendingSourceResult | Promise<PendingSourceResult>,
  source: Pick<PendingView['sources'][number], 'id' | 'kind' | 'name'>,
): Promise<PendingSourceResult> => {
  try {
    return await pool.run(async (signal) => await read(signal), 4000)
  } catch {
    return unavailableSource(source.id, source.kind, source.name)
  }
}
