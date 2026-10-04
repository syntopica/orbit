import { formatAttemptTokens } from '../../formatters/formatAttemptTokens'
import { formatWallTime } from '../../formatters/formatWallTime'
import { jobElapsedMs } from '../../selectors/jobElapsedMs'
import type { RunningJobRowProps } from '../../types/RunningJobRowProps'
import { JobIdLink } from './JobIdLink'
import { JobStateBadge } from './JobStateBadge'

// Tokens are those of earlier attempts: a running attempt reports its own
// only when it settles.
export const RunningJobRow = ({ job, now }: RunningJobRowProps) => (
  <li className="space-y-1 px-3 py-2 text-sm">
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <JobIdLink id={job.id} />
      <JobStateBadge state={job.state} />
      <span className="font-mono break-all">{job.queue}</span>
      <span className="ml-auto tabular-nums">
        <span className="sr-only">Elapsed </span>
        {formatWallTime(jobElapsedMs(job, now))}
      </span>
    </div>
    <dl className="text-muted flex flex-wrap gap-x-4 gap-y-1 text-xs">
      <div className="flex gap-1">
        <dt>Kind</dt>
        <dd className="font-mono">{job.kind ?? '—'}</dd>
      </div>
      <div className="flex min-w-0 gap-1">
        <dt>Model</dt>
        <dd className="font-mono break-all">
          {job.lastModel ?? job.model ?? '—'}
        </dd>
      </div>
      <div className="flex gap-1">
        <dt>Node</dt>
        <dd className="font-mono">{job.leaseNode ?? '—'}</dd>
      </div>
      <div className="flex gap-1">
        <dt>Tokens so far</dt>
        <dd className="tabular-nums">
          {formatAttemptTokens(job.tokensIn, job.tokensOut)}
        </dd>
      </div>
    </dl>
  </li>
)
