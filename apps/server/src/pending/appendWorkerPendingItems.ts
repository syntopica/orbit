import type { PendingView } from '@orbit/contract'
import type { z } from 'zod'

import type { workerJobListReportSchema } from '../adapters/worker/workerJobListReportSchema'
import { toJobView } from '../workerView/toJobView'
import { toWorkerPendingItem } from './toWorkerPendingItem'

export const appendWorkerPendingItems = (
  rows: z.infer<typeof workerJobListReportSchema>['jobs'],
  items: PendingView['items'],
  seen: Set<string>,
  now: number,
): void => {
  for (const row of rows) {
    const item = toWorkerPendingItem(toJobView(row), now)
    if (item === null || seen.has(item.id)) continue
    seen.add(item.id)
    items.push(item)
    if (items.length >= 2000) break
  }
}
