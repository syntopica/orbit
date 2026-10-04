import { workerJobDetailSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { useState } from 'react'

import { apiJson } from '../api/apiJson'

export const useWorkerJobScreen = () => {
  const { id } = useParams({ strict: false })
  const [revision, setRevision] = useState(0)
  const job = useQuery({
    queryKey: ['worker-job', id],
    queryFn: async () =>
      apiJson(
        `/api/worker/jobs/${encodeURIComponent(id ?? '')}`,
        workerJobDetailSchema,
      ),
    refetchInterval: 15_000,
  })
  return {
    id,
    revision,
    job,
    actionCompleted: () => {
      setRevision((value) => value + 1)
    },
  }
}
