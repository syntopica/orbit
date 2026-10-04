import { workerQualitySchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'

import { apiJson } from '../api/apiJson'
import type { WorkerQualityState } from '../types/WorkerQualityState'

export const useWorkerQuality = (): WorkerQualityState => {
  const query = useQuery({
    queryKey: ['worker-quality', '7d'],
    queryFn: async () =>
      apiJson('/api/worker/quality?range=7d', workerQualitySchema),
    refetchInterval: 60_000,
  })
  return {
    view: query.data ?? null,
    failed: query.isError && query.data === undefined,
  }
}
