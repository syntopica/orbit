import type { WorkerActivityReport } from '../../types/WorkerActivityReport'
import type { WorkerAdapterDeps } from '../../types/WorkerAdapterDeps'
import { fetchWorkerText } from './fetchWorkerText'
import { parseWorkerJson } from './parseWorkerJson'
import { workerActivityReportSchema } from './workerActivityReportSchema'

export const fetchWorkerActivity = async (
  deps: Pick<WorkerAdapterDeps, 'url' | 'tokenFile' | 'fetch'>,
  hours: number,
  signal: AbortSignal,
): Promise<WorkerActivityReport> =>
  parseWorkerJson(
    await fetchWorkerText(deps, `/v1/activity?hours=${String(hours)}`, signal),
    workerActivityReportSchema,
  )
