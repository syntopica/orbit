import { workerJobActionSchema } from '@orbit/contract'

import { actionFailure } from './actionFailure'
import { apiFetch } from './apiFetch'

export const postWorkerJobAction = async (
  id: string,
  action: 'cancel' | 'retry' | 'ack',
): Promise<void> => {
  const response = await apiFetch(
    `/api/worker/jobs/${encodeURIComponent(id)}/${action}`,
    { method: 'POST' },
  )
  if (!response.ok) throw await actionFailure(response)
  workerJobActionSchema.parse(await response.json())
}
