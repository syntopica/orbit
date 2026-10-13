import { useWorkerJobActions } from '../../hooks/useWorkerJobActions'
import type { WorkerJobActionsProps } from '../../types/WorkerJobActionsProps'
import { ConfirmJobAction } from './ConfirmJobAction'
import { JobActionButtons } from './JobActionButtons'

export const WorkerJobActions = ({ job, onAction }: WorkerJobActionsProps) => {
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
