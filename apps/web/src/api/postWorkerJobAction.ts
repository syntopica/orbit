import { workerJobActionSchema } from '@orbit/contract'

import { apiFetch } from './apiFetch'

export const postWorkerJobAction = async (
  id: string,
  action: 'cancel' | 'retry' | 'ack',
): Promise<void> => {
  const response = await apiFetch(
    `/api/worker/jobs/${encodeURIComponent(id)}/${action}`,
    { method: 'POST' },
  )
  if (!response.ok) throw new Error(String(response.status))
  workerJobActionSchema.parse(await response.json())
}
