import { formatCount } from '../../formatters/formatCount'
import { formatSpan } from '../../formatters/formatSpan'
import { formatSuccessRate } from '../../formatters/formatSuccessRate'
import type { ExecutorTableRowProps } from '../../types/ExecutorTableRowProps'

export const ExecutorTableRow = ({ row, now }: ExecutorTableRowProps) => (
  <tr>
    <th scope="row" className="px-3 py-2 text-left font-normal">
      <code className="font-mono wrap-break-word">
        {row.provider} / {row.model}
      </code>
      {row.availableAt !== null && row.availableAt > now && (
        <span className="text-warn block text-xs">
          available in {formatSpan(row.availableAt - now)}
        </span>
      )}
    </th>
    <td
      className="text-muted truncate px-3 py-2 font-mono"
      title={row.queues.join(', ')}
    >
      {row.queues.join(', ')}
    </td>
    <td className="px-3 py-2 text-right">{formatCount(row.attempts)}</td>
    <td className="px-3 py-2 text-right">
      {formatSuccessRate(row.succeeded, row.attempts)}
    </td>
    <td className={`px-3 py-2 text-right ${row.lowSample ? 'text-muted' : ''}`}>
      {row.meanScore === null ? '—' : row.meanScore.toFixed(2)}
      {row.lowSample ? ' (n < 20)' : ''}
    </td>
    <td className="px-3 py-2 text-right">{formatCount(row.judged)}</td>
  </tr>
)
