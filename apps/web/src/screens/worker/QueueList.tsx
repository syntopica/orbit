import { formatDuration } from '../../formatters/formatDuration'
import { WORKER_LABELS } from '../../labels/workerLabels'
import type { QueueListProps } from '../../types/QueueListProps'

export const QueueList = ({ rows }: QueueListProps) => (
  <ul className="divide-line border-line bg-panel divide-y rounded-xl border text-sm">
    {rows.map((q) => (
      <li key={q.name} className="space-y-1 px-3 py-2">
        <p className="font-mono">{q.name}</p>
        <p className="text-muted text-xs">
          {WORKER_LABELS.queued} {q.queued} · {WORKER_LABELS.oldest}{' '}
          {q.oldestQueuedMs === null ? '—' : formatDuration(q.oldestQueuedMs)} ·{' '}
          {WORKER_LABELS.failed} {q.failed} · {WORKER_LABELS.succeeded}{' '}
          {q.succeeded} · {WORKER_LABELS.done1h} {q.done1h}
        </p>
      </li>
    ))}
  </ul>
)
