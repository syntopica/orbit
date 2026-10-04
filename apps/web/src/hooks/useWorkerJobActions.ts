import type { WorkerJobDetail } from '@orbit/contract'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { postWorkerJobAction } from '../api/postWorkerJobAction'
import { jobActionAvailability } from '../selectors/jobActionAvailability'

export const useWorkerJobActions = (
  job: WorkerJobDetail,
  onAction: () => void,
) => {
  const client = useQueryClient()
  const [selected, setSelected] = useState<'cancel' | 'retry' | 'ack' | null>(
    null,
  )
  const availability = jobActionAvailability(job)
  const confirm = async () => {
    if (selected === null) return
    await postWorkerJobAction(job.id, selected)
    onAction()
    await client.invalidateQueries({ queryKey: ['worker-job', job.id] })
    await client.invalidateQueries({ queryKey: ['worker-jobs'] })
  }
  return {
    selected,
    ...availability,
    confirm,
    close: () => {
      setSelected(null)
    },
    selectCancel: () => {
      setSelected('cancel')
    },
    selectRetry: () => {
      setSelected('retry')
    },
    selectAck: () => {
      setSelected('ack')
    },
  }
}
