import { formatCount } from '../../formatters/formatCount'
import { formatSpan } from '../../formatters/formatSpan'
import { formatSuccessRate } from '../../formatters/formatSuccessRate'
import type { ExecutorListProps } from '../../types/ExecutorListProps'

// Phones: two compact lines per executor instead of a six-column table.
export const ExecutorRows = ({ rows, now }: ExecutorListProps) => (
  <ul className="divide-line border-line bg-panel divide-y rounded-xl border text-sm">
    {rows.map((row) => (
      <li key={`${row.provider}:${row.model}`} className="space-y-1 px-3 py-2">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <code className="font-mono break-all">
            {row.provider} / {row.model}
          </code>
          {row.availableAt !== null && row.availableAt > now && (
            <span className="text-warn text-xs">
              available in {formatSpan(row.availableAt - now)}
            </span>
          )}
        </div>
        <p className="text-muted text-xs tabular-nums">
          {formatCount(row.attempts)} attempts ·{' '}
          {formatSuccessRate(row.succeeded, row.attempts)} succeeded ·{' '}
          {row.meanScore === null ? '—' : row.meanScore.toFixed(2)} score
          {row.lowSample ? ' (n < 20)' : ''} · {formatCount(row.judged)} judged
        </p>
        <p className="text-muted truncate font-mono text-xs">
          {row.queues.join(', ')}
        </p>
      </li>
    ))}
  </ul>
)
