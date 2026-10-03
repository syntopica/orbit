import type { WorkerAdapterDeps } from '../../types/WorkerAdapterDeps'
import type { WorkerStatus } from '../../types/WorkerStatus'
import { fetchWorkerText } from './fetchWorkerText'
import { parseWorkerStatus } from './parseWorkerStatus'

export const fetchWorkerStatus = async (
  deps: Pick<WorkerAdapterDeps, 'url' | 'tokenFile' | 'fetch'>,
  signal: AbortSignal,
): Promise<WorkerStatus> =>
  parseWorkerStatus(await fetchWorkerText(deps, '/v1/status', signal))
