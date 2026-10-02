import { ProcessError } from '../../process/ProcessError'
import type { WorkerAdapterDeps } from '../../types/WorkerAdapterDeps'
import type { WorkerStatus } from '../../types/WorkerStatus'
import { parseWorkerStatus } from './parseWorkerStatus'
import { readCappedText } from './readCappedText'
import { readWorkerToken } from './readWorkerToken'

export const fetchWorkerStatus = async (
  deps: WorkerAdapterDeps,
  signal: AbortSignal,
): Promise<WorkerStatus> => {
  const token = await readWorkerToken(deps.tokenFile)
  const response = await deps.fetch(`${deps.url}/v1/status`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  })
  if (response.status === 401 || response.status === 403)
    throw new ProcessError('unauthorized')
  if (!response.ok) throw new ProcessError('unreachable')
  return parseWorkerStatus(await readCappedText(response))
}
