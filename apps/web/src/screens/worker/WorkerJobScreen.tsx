import { Link } from '@tanstack/react-router'

import { useWorkerJobScreen } from '../../hooks/useWorkerJobScreen'
import { AttemptWaterfall } from './AttemptWaterfall'
import { JobContentPanel } from './JobContentPanel'
import { JobHeader } from './JobHeader'
import { JobResultPanel } from './JobResultPanel'
import { WorkerJobActions } from './WorkerJobActions'

export const WorkerJobScreen = () => {
  const model = useWorkerJobScreen()
  const job = model.job.data
  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <Link to="/worker/jobs" className="text-accent text-sm underline">
        ← Jobs
      </Link>
      {model.job.isPending ? <p>Loading job…</p> : null}
      {model.job.isError ? <p role="alert">Could not read job.</p> : null}
      {job ? (
        <>
          <JobHeader job={job} />
          <AttemptWaterfall attempts={job.attemptDetails} />
          <JobResultPanel job={job} />
          <JobContentPanel
            key={`${model.id ?? ''}-${String(model.revision)}`}
            job={job}
          />
          <WorkerJobActions job={job} onAction={model.actionCompleted} />
        </>
      ) : null}
    </main>
  )
}
