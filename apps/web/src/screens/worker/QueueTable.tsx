import { formatDuration } from '../../formatters/formatDuration'
import { WORKER_LABELS } from '../../labels/workerLabels'
import type { QueueTableProps } from '../../types/QueueTableProps'
import { QueueList } from './QueueList'

export const QueueTable = ({ rows, isPhone }: QueueTableProps) =>
  isPhone ? (
    <QueueList rows={rows} />
  ) : (
    <table className="border-line bg-panel w-full rounded-xl border text-sm">
      <thead className="text-muted text-left text-xs">
        <tr>
          <th scope="col" className="px-3 py-2">
            {WORKER_LABELS.queue}
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
          <tr key={q.name} className="font-mono">
            <th scope="row" className="px-3 py-2 text-left font-normal">
              {q.name}
            </th>
            <td className="px-3 py-2 text-right">{q.queued}</td>
            <td className="px-3 py-2 text-right">
              {q.oldestQueuedMs === null
                ? '—'
                : formatDuration(q.oldestQueuedMs)}
            </td>
            <td className="px-3 py-2 text-right">{q.failed}</td>
            <td className="px-3 py-2 text-right">{q.succeeded}</td>
            <td className="px-3 py-2 text-right">{q.done1h}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
