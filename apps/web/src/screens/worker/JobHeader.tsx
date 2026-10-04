import type { WorkerJobDetail } from '@orbit/contract'

import { jobSummaryItems } from '../../selectors/jobSummaryItems'
import { LabelledValueList } from './LabelledValueList'

export const JobHeader = ({ job }: { job: WorkerJobDetail }) => (
  <header className="space-y-3">
    <h1 className="font-mono text-2xl font-semibold break-all">{job.id}</h1>
    <p className="text-muted flex flex-wrap gap-x-4 text-sm">
      <span>{job.queue}</span>
      <span>{job.producer}</span>
      <span>{job.state}</span>
      <span>{job.privacy}</span>
      <span>{job.tier}</span>
    </p>
    <p className="text-muted text-sm">
      Created {new Date(job.createdAt).toLocaleString()} · Updated{' '}
      {new Date(job.updatedAt).toLocaleString()} · {job.attempts} attempts
    </p>
    {job.lastError ? (
      <p className="text-warn font-mono text-sm">{job.lastError}</p>
    ) : null}
    <LabelledValueList items={jobSummaryItems(job)} />
  </header>
)
