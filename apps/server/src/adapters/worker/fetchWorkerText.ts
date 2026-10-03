import { ProcessError } from '../../process/ProcessError'
import type { WorkerAdapterDeps } from '../../types/WorkerAdapterDeps'
import { readCappedText } from './readCappedText'
import { readWorkerToken } from './readWorkerToken'

// One admin GET against the coordinator; the body is capped, never echoed.
export const fetchWorkerText = async (
  deps: Pick<WorkerAdapterDeps, 'url' | 'tokenFile' | 'fetch'>,
  path: string,
  signal: AbortSignal,
): Promise<string> => {
  const token = await readWorkerToken(deps.tokenFile)
  const response = await deps.fetch(new URL(path, deps.url).href, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  })
  if (!response.ok) {
    // An unread body keeps the connection busy until garbage collection.
    await response.body?.cancel()
    const denied = response.status === 401 || response.status === 403
    throw new ProcessError(denied ? 'unauthorized' : 'unreachable')
  }
  return readCappedText(response)
}
