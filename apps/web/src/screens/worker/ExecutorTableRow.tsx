import { formatCount } from '../../formatters/formatCount'
import type { ExecutorRow } from '../../types/ExecutorRow'

export const ExecutorTableRow = ({
  provider,
  model,
  queues,
  attempts,
  succeeded,
  meanScore,
  lowSample,
  judged,
}: ExecutorRow) => (
  <tr>
    <th scope="row" className="p-2 font-mono font-normal">
      {provider} / {model}
    </th>
    <td className="p-2 font-mono">{queues.join(', ')}</td>
    <td className="p-2 text-right">{formatCount(attempts)}</td>
    <td className="p-2 text-right">
      {attempts === 0
        ? '—'
        : `${String(Math.round((succeeded / attempts) * 100))}%`}
    </td>
    <td className={`p-2 text-right ${lowSample ? 'text-muted' : ''}`}>
      {meanScore === null ? '—' : meanScore.toFixed(2)}
      {lowSample ? ' (n < 20)' : ''}
    </td>
    <td className="p-2 text-right">{formatCount(judged)}</td>
  </tr>
)
