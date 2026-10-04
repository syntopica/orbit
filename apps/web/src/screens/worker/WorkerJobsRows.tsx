import { formatJobCreated } from '../../formatters/formatJobCreated'
import type { WorkerJobsTableProps } from '../../types/WorkerJobsTableProps'
import { JobIdLink } from './JobIdLink'
import { JobStateBadge } from './JobStateBadge'

// Phones: two compact lines per job instead of a six-column table.
export const WorkerJobsRows = ({ jobs }: WorkerJobsTableProps) => (
  <ul className="divide-line border-line bg-panel divide-y rounded-xl border text-sm">
    {jobs.map((job) => (
      <li key={job.id} className="space-y-1 px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <JobIdLink id={job.id} />
          <JobStateBadge state={job.state} />
        </div>
        <div className="text-muted flex min-w-0 items-baseline gap-x-3 text-xs">
          <span className="min-w-0 truncate font-mono" title={job.queue}>
            {job.queue}
          </span>
          <span className="shrink-0">{job.privacy}</span>
          <time
            dateTime={new Date(job.createdAt).toISOString()}
            className="ml-auto shrink-0 tabular-nums"
          >
            {formatJobCreated(job.createdAt)}
          </time>
        </div>
      </li>
    ))}
  </ul>
)
