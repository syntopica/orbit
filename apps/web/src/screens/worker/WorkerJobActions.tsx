import type { WorkerJobDetail } from '@orbit/contract'

import { useWorkerJobActions } from '../../hooks/useWorkerJobActions'
import { ConfirmJobAction } from './ConfirmJobAction'
import { JobActionButtons } from './JobActionButtons'

export const WorkerJobActions = ({
  job,
  onAction,
}: {
  job: WorkerJobDetail
  onAction: () => void
}) => {
  const model = useWorkerJobActions(job, onAction)
  return (
    <section aria-label="Job actions" className="space-y-3">
      <h2 className="text-lg font-semibold">Actions</h2>
      <JobActionButtons model={model} />
      {model.selected !== null ? (
        <ConfirmJobAction
          id={job.id}
          action={model.selected}
          close={model.close}
          confirm={model.confirm}
        />
      ) : null}
    </section>
  )
}
