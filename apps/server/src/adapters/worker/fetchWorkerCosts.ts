import type { WorkerAdapterDeps } from '../../types/WorkerAdapterDeps'
import type { WorkerCostsReport } from '../../types/WorkerCostsReport'
import { fetchWorkerText } from './fetchWorkerText'
import { parseWorkerJson } from './parseWorkerJson'
import { workerCostsReportSchema } from './workerCostsReportSchema'

export const fetchWorkerCosts = async (
  deps: Pick<WorkerAdapterDeps, 'url' | 'tokenFile' | 'fetch'>,
  days: number,
  signal: AbortSignal,
): Promise<WorkerCostsReport> =>
  parseWorkerJson(
    await fetchWorkerText(deps, `/v1/costs?days=${String(days)}`, signal),
    workerCostsReportSchema,
  )
