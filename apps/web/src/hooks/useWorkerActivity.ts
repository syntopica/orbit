import { workerActivitySchema } from '@orbit/contract'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useMemo } from 'react'

import { apiJson } from '../api/apiJson'
import { selectWorkerActivity } from '../selectors/selectWorkerActivity'
import type { WorkerActivityState } from '../types/WorkerActivityState'
import { validateWorkerSearch } from '../validators/validateWorkerSearch'

export const useWorkerActivity = (): WorkerActivityState => {
  const { range, costs } = validateWorkerSearch(useSearch({ strict: false }))
  const navigate = useNavigate()
  const query = useQuery({
    queryKey: ['worker-activity', range],
    queryFn: async () =>
      apiJson(`/api/worker/activity?range=${range}`, workerActivitySchema),
    refetchInterval: 60_000,
    placeholderData: keepPreviousData,
  })
  const model = useMemo(
    () => (query.data === undefined ? null : selectWorkerActivity(query.data)),
    [query.data],
  )
  return {
    model,
    stale: query.isPlaceholderData,
    failed: query.isError && model === null,
    range,
    setRange: (next) =>
      void navigate({
        to: '/worker',
        search: { range: next, ...(costs === undefined ? {} : { costs }) },
      }),
  }
}
