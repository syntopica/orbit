import { workerCostsSchema } from '@orbit/contract'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { apiJson } from '../api/apiJson'
import type { WorkerCostsState } from '../types/WorkerCostsState'
import { validateWorkerSearch } from '../validators/validateWorkerSearch'

export const useWorkerCosts = (): WorkerCostsState => {
  const { costs = '24h', range } = validateWorkerSearch(
    useSearch({ strict: false }),
  )
  const navigate = useNavigate()
  const query = useQuery({
    queryKey: ['worker-costs', costs],
    queryFn: async () =>
      apiJson(`/api/worker/costs?range=${costs}`, workerCostsSchema),
    refetchInterval: 60_000,
    placeholderData: keepPreviousData,
  })
  return {
    view: query.data ?? null,
    stale: query.isPlaceholderData,
    failed: query.isError && query.data === undefined,
    range: costs,
    setRange: (next) =>
      void navigate({ to: '/worker', search: { range, costs: next } }),
  }
}
