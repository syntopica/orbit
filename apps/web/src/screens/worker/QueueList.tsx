import { formatDuration } from '../../formatters/formatDuration'
import { useExpandedSet } from '../../hooks/useExpandedSet'
import { WORKER_LABELS } from '../../labels/workerLabels'
import type { QueueListProps } from '../../types/QueueListProps'
import { QueueDetail } from './QueueDetail'
import { QueueSpark } from './QueueSpark'
import { QueueToggle } from './QueueToggle'

export const QueueList = ({ rows, activity }: QueueListProps) => {
  const expanded = useExpandedSet()
  return (
    <ul className="divide-line border-line bg-panel divide-y rounded-xl border text-sm">
      {rows.map((q) => (
        <li key={q.name} className="space-y-1 px-3 py-2">
          <QueueToggle
            name={q.name}
            controls={`queue-detail-${q.name}`}
            open={expanded.isOpen(q.name)}
            onToggle={() => {
              expanded.toggle(q.name)
            }}
          />
          <p className="text-muted text-xs">
            {WORKER_LABELS.queued} {q.queued} · {WORKER_LABELS.oldest}{' '}
            {q.oldestQueuedMs === null ? '—' : formatDuration(q.oldestQueuedMs)}{' '}
            · {WORKER_LABELS.failed} {q.failed} · {WORKER_LABELS.succeeded}{' '}
            {q.succeeded} · {WORKER_LABELS.done1h} {q.done1h}
          </p>
          <QueueSpark
            name={q.name}
            model={activity.model}
            stale={activity.stale}
          />
          {expanded.isOpen(q.name) && (
            <QueueDetail
              id={`queue-detail-${q.name}`}
              name={q.name}
              model={activity.model}
            />
          )}
        </li>
      ))}
    </ul>
  )
}
