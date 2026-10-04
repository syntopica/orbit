import { formatJobCount } from '../../formatters/formatJobCount'
import type { useWorkerJobsScreen } from '../../hooks/useWorkerJobsScreen'
import { WorkerJobsRows } from './WorkerJobsRows'
import { WorkerJobsTable } from './WorkerJobsTable'

export const WorkerJobsList = ({
  model,
}: {
  model: ReturnType<typeof useWorkerJobsScreen>
}) => {
  const data = model.jobs.data
  if (data === undefined) return null
  return (
    <section aria-label="Job list" className="space-y-3">
      <p role="status" className="text-muted text-sm">
        {model.reading
          ? 'Reading jobs…'
          : formatJobCount(data.jobs.length, data.next !== null)}
      </p>
      {data.jobs.length === 0 ? <p>No jobs found.</p> : null}
      {data.jobs.length > 0 && model.isPhone ? (
        <WorkerJobsRows jobs={data.jobs} />
      ) : null}
      {data.jobs.length > 0 && !model.isPhone ? (
        <WorkerJobsTable jobs={data.jobs} />
      ) : null}
      {data.next ? (
        <button
          type="button"
          className="text-accent underline"
          onClick={model.older}
        >
          Older
        </button>
      ) : null}
    </section>
  )
}
