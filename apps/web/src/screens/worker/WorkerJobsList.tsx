import { Link } from '@tanstack/react-router'

import type { useWorkerJobsScreen } from '../../hooks/useWorkerJobsScreen'

export const WorkerJobsList = ({
  model,
}: {
  model: ReturnType<typeof useWorkerJobsScreen>
}) => {
  const data = model.jobs.data
  if (data === undefined) return null
  return (
    <section aria-label="Job list" className="space-y-3">
      {data.jobs.length === 0 ? <p>No jobs found.</p> : null}
      <ul className="space-y-2">
        {data.jobs.map((job) => (
          <li
            key={job.id}
            className="border-line bg-panel rounded-xl border p-3"
          >
            <Link
              to="/worker/jobs/$id"
              params={{ id: job.id }}
              className="text-accent font-mono underline"
            >
              {job.id}
            </Link>
            <div className="text-muted mt-1 flex flex-wrap gap-x-4 text-sm">
              <span>{job.queue}</span>
              <span>{job.producer}</span>
              <span>{job.state}</span>
              <span>{job.privacy}</span>
              <time dateTime={new Date(job.createdAt).toISOString()}>
                {new Date(job.createdAt).toLocaleString()}
              </time>
            </div>
          </li>
        ))}
      </ul>
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
