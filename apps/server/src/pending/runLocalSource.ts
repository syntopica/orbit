import type { PendingView } from '@orbit/contract'

import type { PendingSourceResult } from '../types/PendingSourceResult'
import { unavailableSource } from './unavailableSource'

// A source that starts no subprocess and calls no service: read at once,
// outside the detail pool, under the same 4 s abort as pooled sources.
export const runLocalSource = async (
  read: (
    signal: AbortSignal,
  ) => PendingSourceResult | Promise<PendingSourceResult>,
  source: Pick<PendingView['sources'][number], 'id' | 'kind' | 'name'>,
  timeoutMs = 4000,
): Promise<PendingSourceResult> => {
  const signal = AbortSignal.timeout(timeoutMs)
  try {
    return await read(signal)
  } catch {
    return unavailableSource(source.id, source.kind, source.name)
  }
}
