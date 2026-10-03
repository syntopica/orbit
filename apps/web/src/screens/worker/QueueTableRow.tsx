import { formatDuration } from '../../formatters/formatDuration'
import type { QueueRowProps } from '../../types/QueueRowProps'
import { QueueDetail } from './QueueDetail'
import { QueueSpark } from './QueueSpark'
import { QueueToggle } from './QueueToggle'

export const QueueTableRow = ({
  queue: q,
  model,
  stale,
  open,
  onToggle,
}: QueueRowProps) => (
  <>
    <tr className="font-mono">
      <th scope="row" className="px-3 py-2 text-left font-normal">
        <QueueToggle
          name={q.name}
          controls={`queue-detail-${q.name}`}
          open={open}
          onToggle={onToggle}
        />
      </th>
      <td className="w-28 px-3 py-1">
        <QueueSpark name={q.name} model={model} stale={stale} />
      </td>
      <td className="px-3 py-2 text-right">{q.queued}</td>
      <td className="px-3 py-2 text-right">
        {q.oldestQueuedMs === null ? '—' : formatDuration(q.oldestQueuedMs)}
      </td>
      <td className="px-3 py-2 text-right">{q.failed}</td>
      <td className="px-3 py-2 text-right">{q.succeeded}</td>
      <td className="px-3 py-2 text-right">{q.done1h}</td>
    </tr>
    {open ? (
      <tr>
        <td colSpan={7} className="px-3">
          <QueueDetail
            id={`queue-detail-${q.name}`}
            name={q.name}
            model={model}
          />
        </td>
      </tr>
    ) : null}
  </>
)
