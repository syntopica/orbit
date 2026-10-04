import { formatCount } from '../../formatters/formatCount'
import { formatSpan } from '../../formatters/formatSpan'
import type { ExecutorListProps } from '../../types/ExecutorListProps'

export const ExecutorList = ({ rows, now }: ExecutorListProps) => (
  <ul className="divide-line border-line bg-panel divide-y rounded-xl border text-sm">
    {rows.map((row) => (
      <li key={`${row.provider}:${row.model}`} className="space-y-2 p-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <code className="font-mono font-semibold">
            {row.provider} / {row.model}
          </code>
          {row.availableAt !== null && row.availableAt > now && (
            <span className="text-warn">
              available in {formatSpan(row.availableAt - now)}
            </span>
          )}
        </div>
        <p className="text-muted">Queues: {row.queues.join(', ')}</p>
        <p className="tabular-nums">
          {formatCount(row.attempts)} attempts ·{' '}
          {row.attempts === 0
            ? '—'
            : `${String(Math.round((row.succeeded / row.attempts) * 100))}%`}{' '}
          succeeded ·{' '}
          <span className={row.lowSample ? 'text-muted' : undefined}>
            {row.meanScore === null ? '—' : row.meanScore.toFixed(2)} mean
            judged score
            {row.lowSample ? ' (n < 20)' : ''}
          </span>{' '}
          · {formatCount(row.judged)} judged
        </p>
      </li>
    ))}
  </ul>
)
