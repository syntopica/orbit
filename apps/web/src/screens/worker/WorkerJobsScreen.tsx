import { Link } from '@tanstack/react-router'

import { useWorkerJobsScreen } from '../../hooks/useWorkerJobsScreen'
import { WorkerJobsFilters } from './WorkerJobsFilters'
import { WorkerJobsList } from './WorkerJobsList'

export const WorkerJobsScreen = () => {
  const model = useWorkerJobsScreen()
  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-2">
        <Link
          to="/worker"
          search={{ range: '24h' }}
          className="text-accent text-sm underline"
        >
          ← Worker
        </Link>
        <h1 className="text-2xl font-semibold">Jobs</h1>
      </header>
      <WorkerJobsFilters model={model} />
      {model.jobs.isPending ? <p>Loading jobs…</p> : null}
      {model.jobs.isError ? <p role="alert">Could not read jobs.</p> : null}
      <WorkerJobsList model={model} />
    </main>
  )
}
