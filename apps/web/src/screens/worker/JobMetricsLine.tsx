import { formatAttemptTokens } from '../../formatters/formatAttemptTokens'
import { formatCostOrDash } from '../../formatters/formatCostOrDash'
import { formatJobResult } from '../../formatters/formatJobResult'
import { formatWallTime } from '../../formatters/formatWallTime'
import type { JobMetricsLineProps } from '../../types/JobMetricsLineProps'

// The phone list's third line: the same metrics as the table's columns.
export const JobMetricsLine = ({ job }: JobMetricsLineProps) => (
  <div className="text-muted flex min-w-0 flex-wrap items-baseline gap-x-3 text-xs">
    <span className="min-w-0 truncate font-mono">
      {job.lastModel ?? job.model ?? '—'}
    </span>
    <span className="tabular-nums">
      {formatAttemptTokens(job.tokensIn, job.tokensOut)}
    </span>
    <span className="tabular-nums">{formatCostOrDash(job.costUsd)}</span>
    <span className="tabular-nums">{formatWallTime(job.wallMs)}</span>
    <span className="font-mono">{formatJobResult(job)}</span>
  </div>
)
