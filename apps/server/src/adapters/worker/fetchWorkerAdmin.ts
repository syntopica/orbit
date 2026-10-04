import type { WorkerAdapterDeps } from '../../types/WorkerAdapterDeps'
import type { WorkerJobClient } from '../../types/WorkerJobClient'
import { readCappedText } from './readCappedText'
import { readWorkerToken } from './readWorkerToken'

export const fetchWorkerAdmin =
  (
    deps: Pick<WorkerAdapterDeps, 'url' | 'tokenFile' | 'fetch'>,
  ): WorkerJobClient =>
  async (path, method, reveal, signal) => {
    const token = await readWorkerToken(deps.tokenFile)
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` }
    if (reveal !== null) headers['X-Worker-Reveal'] = reveal
    const response = await deps.fetch(new URL(path, deps.url).href, {
      method,
      headers,
      signal,
    })
    return { status: response.status, body: await readCappedText(response) }
  }
