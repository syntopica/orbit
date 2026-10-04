import { formatCostOrDash } from '../../formatters/formatCostOrDash'
import { formatJobCreated } from '../../formatters/formatJobCreated'
import { formatJobResult } from '../../formatters/formatJobResult'
import { formatTokenPair } from '../../formatters/formatTokenPair'
import { formatWallTime } from '../../formatters/formatWallTime'
import type { WorkerJobsTableRowProps } from '../../types/WorkerJobsTableRowProps'
import { JobIdLink } from './JobIdLink'
import { JobStateBadge } from './JobStateBadge'

// Model is the newest attempt's, else the one requested; tokens, cost and
// duration sum the settled attempts.
export const WorkerJobsTableRow = ({
  job,
  showCost,
}: WorkerJobsTableRowProps) => {
  const model = job.lastModel ?? job.model ?? '—'
  const result = formatJobResult(job)
  return (
    <tr>
      <th scope="row" className="p-2 text-left font-normal">
        <JobIdLink id={job.id} />
      </th>
      <td className="p-2 font-mono text-xs">{job.queue}</td>
      <td className="hidden p-2 font-mono text-xs xl:table-cell">
        {job.producer}
      </td>
      <td className="p-2 whitespace-nowrap">
        <JobStateBadge state={job.state} />
      </td>
      <td className="text-muted hidden p-2 xl:table-cell">{job.privacy}</td>
      <td className="p-2 font-mono text-xs">{model}</td>
      <td className="p-2 text-right text-xs whitespace-nowrap tabular-nums">
        {formatTokenPair(job.tokensIn, job.tokensOut)}
      </td>
      {showCost ? (
        <td className="p-2 text-right tabular-nums">
          {formatCostOrDash(job.costUsd)}
        </td>
      ) : null}
      <td className="p-2 text-right whitespace-nowrap tabular-nums">
        {formatWallTime(job.wallMs)}
      </td>
      <td className="p-2 font-mono text-xs">{result}</td>
      <td className="text-muted p-2 text-right whitespace-nowrap tabular-nums">
        <time dateTime={new Date(job.createdAt).toISOString()}>
          {formatJobCreated(job.createdAt)}
        </time>
      </td>
    </tr>
  )
}
