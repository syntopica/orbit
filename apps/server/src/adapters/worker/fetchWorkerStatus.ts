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
  const response = await deps.fetch(new URL('/v1/status', deps.url).href, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  })
  if (!response.ok) {
    // An unread body keeps the connection busy until garbage collection.
    await response.body?.cancel()
    const denied = response.status === 401 || response.status === 403
    throw new ProcessError(denied ? 'unauthorized' : 'unreachable')
  }
  return parseWorkerStatus(await readCappedText(response))
}
