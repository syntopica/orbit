import { useExpandedSet } from '../../hooks/useExpandedSet'
import { ACTIVITY_LABELS } from '../../labels/activityLabels'
import { WORKER_LABELS } from '../../labels/workerLabels'
import type { QueueTableProps } from '../../types/QueueTableProps'
import { QueueList } from './QueueList'
import { QueueTableRow } from './QueueTableRow'

export const QueueTable = ({ rows, isPhone, activity }: QueueTableProps) => {
  const expanded = useExpandedSet()
  return isPhone ? (
    <QueueList rows={rows} activity={activity} />
  ) : (
    <table className="border-line bg-panel w-full rounded-xl border text-sm">
      <thead className="text-muted text-left text-xs">
        <tr>
          <th scope="col" className="px-3 py-2">
            {WORKER_LABELS.queue}
          </th>
          <th scope="col" className="px-3 py-2">
            {ACTIVITY_LABELS.succeeded}
          </th>
          <th scope="col" className="px-3 py-2 text-right">
            {WORKER_LABELS.queued}
          </th>
          <th scope="col" className="px-3 py-2 text-right">
            {WORKER_LABELS.oldest}
          </th>
          <th scope="col" className="px-3 py-2 text-right">
            {WORKER_LABELS.failed}
          </th>
          <th scope="col" className="px-3 py-2 text-right">
            {WORKER_LABELS.succeeded}
          </th>
          <th scope="col" className="px-3 py-2 text-right">
            {WORKER_LABELS.done1h}
          </th>
        </tr>
      </thead>
      <tbody className="divide-line divide-y">
        {rows.map((q) => (
          <QueueTableRow
            key={q.name}
            queue={q}
            model={activity.model}
            stale={activity.stale}
            open={expanded.isOpen(q.name)}
            onToggle={() => {
              expanded.toggle(q.name)
            }}
          />
        ))}
      </tbody>
    </table>
  )
}
