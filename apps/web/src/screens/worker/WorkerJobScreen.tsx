import { Link } from '@tanstack/react-router'

import { useWorkerJobScreen } from '../../hooks/useWorkerJobScreen'
import { AttemptWaterfall } from './AttemptWaterfall'
import { JobContentPanel } from './JobContentPanel'
import { WorkerJobActions } from './WorkerJobActions'

export const WorkerJobScreen = () => {
  const model = useWorkerJobScreen()
  const job = model.job.data
  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <Link to="/worker/jobs" className="text-accent text-sm underline">
        ← Jobs
      </Link>
      {model.job.isPending ? <p>Loading job…</p> : null}
      {model.job.isError ? <p role="alert">Could not read job.</p> : null}
      {job ? (
        <>
          <header className="space-y-2">
            <h1 className="font-mono text-2xl font-semibold break-all">
              {job.id}
            </h1>
            <p className="text-muted flex flex-wrap gap-x-4 text-sm">
              <span>{job.queue}</span>
              <span>{job.producer}</span>
              <span>{job.state}</span>
              <span>{job.privacy}</span>
              <span>{job.tier}</span>
            </p>
            <p className="text-muted text-sm">
              Created {new Date(job.createdAt).toLocaleString()} · Updated{' '}
              {new Date(job.updatedAt).toLocaleString()} · {job.attempts}{' '}
              attempts
            </p>
            {job.lastError ? (
              <p className="text-warn font-mono text-sm">{job.lastError}</p>
            ) : null}
          </header>
          <AttemptWaterfall attempts={job.attemptDetails} />
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
