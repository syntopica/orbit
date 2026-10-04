import { formatAttemptTokens } from '../../formatters/formatAttemptTokens'
import { formatCostOrDash } from '../../formatters/formatCostOrDash'
import { formatJobCreated } from '../../formatters/formatJobCreated'
import { formatJobResult } from '../../formatters/formatJobResult'
import { formatWallTime } from '../../formatters/formatWallTime'
import type { WorkerJobsTableRowProps } from '../../types/WorkerJobsTableRowProps'
import { JobIdLink } from './JobIdLink'
import { JobStateBadge } from './JobStateBadge'

// Model is the newest attempt's, else the one requested; tokens, cost and
// duration sum the settled attempts.
export const WorkerJobsTableRow = ({ job }: WorkerJobsTableRowProps) => {
  const model = job.lastModel ?? job.model ?? '—'
  const result = formatJobResult(job)
  return (
    <tr>
      <th scope="row" className="px-3 py-2 text-left font-normal">
        <JobIdLink id={job.id} />
      </th>
      <td className="truncate px-3 py-2 font-mono" title={job.queue}>
        {job.queue}
      </td>
      <td
        className="hidden truncate px-3 py-2 font-mono lg:table-cell"
        title={job.producer}
      >
        {job.producer}
      </td>
      <td className="px-3 py-2">
        <JobStateBadge state={job.state} />
      </td>
      <td className="text-muted hidden px-3 py-2 lg:table-cell">
        {job.privacy}
      </td>
      <td className="truncate px-3 py-2 font-mono" title={model}>
        {model}
      </td>
      <td className="px-3 py-2 text-right text-xs tabular-nums">
        {formatAttemptTokens(job.tokensIn, job.tokensOut)}
      </td>
      <td className="px-3 py-2 text-right tabular-nums">
        {formatCostOrDash(job.costUsd)}
      </td>
      <td className="px-3 py-2 text-right tabular-nums">
        {formatWallTime(job.wallMs)}
      </td>
      <td className="truncate px-3 py-2 font-mono" title={result}>
        {result}
      </td>
      <td className="text-muted px-3 py-2 text-right tabular-nums">
        <time dateTime={new Date(job.createdAt).toISOString()}>
          {formatJobCreated(job.createdAt)}
        </time>
      </td>
    </tr>
  )
}
