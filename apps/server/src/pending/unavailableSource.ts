import type { PendingView } from '@orbit/contract'

import type { PendingSourceResult } from '../types/PendingSourceResult'

export const unavailableSource = (
  id: string,
  kind: PendingView['sources'][number]['kind'],
  name: string,
): PendingSourceResult => ({
  source: { id, kind, name, status: 'unavailable', count: 0 },
  items: [],
})
