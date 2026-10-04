import type { WorkerAdapterDeps } from '../../types/WorkerAdapterDeps'
import type { WorkerQualityReport } from '../../types/WorkerQualityReport'
import { fetchWorkerText } from './fetchWorkerText'
import { parseWorkerJson } from './parseWorkerJson'
import { workerQualityReportSchema } from './workerQualityReportSchema'

export const fetchWorkerQuality = async (
  deps: Pick<WorkerAdapterDeps, 'url' | 'tokenFile' | 'fetch'>,
  days: number,
  signal: AbortSignal,
): Promise<WorkerQualityReport> =>
  parseWorkerJson(
    await fetchWorkerText(deps, `/v1/quality?days=${String(days)}`, signal),
    workerQualityReportSchema,
  )
