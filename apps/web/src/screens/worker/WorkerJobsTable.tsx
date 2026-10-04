import { formatJobCreated } from '../../formatters/formatJobCreated'
import type { WorkerJobsTableProps } from '../../types/WorkerJobsTableProps'
import { JobIdLink } from './JobIdLink'
import { JobStateBadge } from './JobStateBadge'

export const WorkerJobsTable = ({ jobs }: WorkerJobsTableProps) => (
  <table className="border-line bg-panel w-full table-fixed rounded-xl border text-sm">
    <thead className="text-muted text-left text-xs">
      <tr>
        <th scope="col" className="w-28 px-3 py-2">
          Job
        </th>
        <th scope="col" className="px-3 py-2">
          Queue
        </th>
        <th scope="col" className="px-3 py-2">
          Producer
        </th>
        <th scope="col" className="w-28 px-3 py-2">
          State
        </th>
        <th scope="col" className="w-24 px-3 py-2">
          Privacy
        </th>
        <th scope="col" className="w-36 px-3 py-2 text-right">
          Created
        </th>
      </tr>
    </thead>
    <tbody className="divide-line divide-y">
      {jobs.map((job) => (
        <tr key={job.id}>
          <th scope="row" className="px-3 py-2 text-left font-normal">
            <JobIdLink id={job.id} />
          </th>
          <td className="truncate px-3 py-2 font-mono" title={job.queue}>
            {job.queue}
          </td>
          <td className="truncate px-3 py-2 font-mono" title={job.producer}>
            {job.producer}
          </td>
          <td className="px-3 py-2">
            <JobStateBadge state={job.state} />
          </td>
          <td className="text-muted px-3 py-2">{job.privacy}</td>
          <td className="text-muted px-3 py-2 text-right tabular-nums">
            <time dateTime={new Date(job.createdAt).toISOString()}>
              {formatJobCreated(job.createdAt)}
            </time>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)
