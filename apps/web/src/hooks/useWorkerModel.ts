import { workerViewSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { apiJson } from '../api/apiJson'
import { selectWorkerBody } from '../selectors/selectWorkerBody'
import type { WorkerModel } from '../types/WorkerModel'
import { useMediaQuery } from './useMediaQuery'

export const useWorkerModel = (): WorkerModel => {
  const isPhone = useMediaQuery('(max-width: 767px)')
  const query = useQuery({
    queryKey: ['worker'],
    queryFn: async () => apiJson('/api/worker', workerViewSchema),
    refetchInterval: 15_000,
  })
  const body = useMemo(
    () => (query.data === undefined ? null : selectWorkerBody(query.data)),
    [query.data],
  )
  // A failed refetch keeps the last good view on screen.
  return { body, failed: query.isError && body === null, isPhone }
}
