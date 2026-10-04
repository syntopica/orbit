import { workerJobListSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'

import { apiJson } from '../api/apiJson'
import { RUNNING_JOBS_PATH } from '../api/runningJobsPath'
import type { RunningJobsState } from '../types/RunningJobsState'
import { useNow } from './useNow'

// Live jobs every 5 s, and a 1 s clock so elapsed times move between reads.
export const useRunningJobs = (): RunningJobsState => {
  const now = useNow(1000)
  const query = useQuery({
    queryKey: ['worker-running'],
    queryFn: async () => apiJson(RUNNING_JOBS_PATH, workerJobListSchema),
    refetchInterval: 5000,
  })
  // A failed refetch keeps the last good list on screen.
  return {
    jobs: query.data?.jobs ?? null,
    failed: query.isError && query.data === undefined,
    now,
  }
}
