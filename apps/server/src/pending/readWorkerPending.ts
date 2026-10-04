import type { PendingView } from '@orbit/contract'

import { parseWorkerJson } from '../adapters/worker/parseWorkerJson'
import { workerJobListReportSchema } from '../adapters/worker/workerJobListReportSchema'
import type { PendingSourceResult } from '../types/PendingSourceResult'
import type { WorkerJobClient } from '../types/WorkerJobClient'
import { appendWorkerPendingItems } from './appendWorkerPendingItems'
import { trackWorkerCursor } from './trackWorkerCursor'

export const readWorkerPending = async (
  read: WorkerJobClient,
  signal: AbortSignal,
  now: number,
): Promise<PendingSourceResult> => {
  const items: PendingView['items'] = []
  let before: string | null = null
  const seen = new Set<string>()
  const cursors = new Set<string>()
  do {
    const params = new URLSearchParams({ state: 'failed', limit: '100' })
    if (before !== null) params.set('before', before)
    const response = await read(
      `/v1/admin/jobs?${params.toString()}`,
      'GET',
      null,
      signal,
    )
    if (response.status !== 200) throw new Error('worker unavailable')
    const report = parseWorkerJson(response.body, workerJobListReportSchema)
    appendWorkerPendingItems(report.jobs, items, seen, now)
    before = report.next
    trackWorkerCursor(before, cursors)
  } while (before !== null && items.length < 2000 && !signal.aborted)
  return {
    source: {
      id: 'worker',
      kind: 'worker',
      name: 'Worker failures',
      status: 'ok',
      count: items.length,
    },
    items,
  }
}
