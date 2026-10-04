import { workerJobContentSchema } from '@orbit/contract'

import { apiFetch } from './apiFetch'

export const fetchWorkerJobContent = async (
  id: string,
  privacy: string,
  signal: AbortSignal,
) => {
  const response = await apiFetch(
    `/api/worker/jobs/${encodeURIComponent(id)}/content`,
    {
      headers:
        privacy === 'public' || privacy === 'internal'
          ? {}
          : { 'X-Orbit-Reveal': privacy },
      signal,
    },
  )
  if (!response.ok) throw new Error(String(response.status))
  return workerJobContentSchema.parse(await response.json())
}
