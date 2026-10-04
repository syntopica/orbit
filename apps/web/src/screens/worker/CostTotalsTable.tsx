import { formatCount } from '../../formatters/formatCount'
import { formatUsd } from '../../formatters/formatUsd'
import type { CostTotalsTableProps } from '../../types/CostTotalsTableProps'

export const CostTotalsTable = ({ rows }: CostTotalsTableProps) => (
  <table className="w-full text-left text-xs tabular-nums">
    <caption className="text-muted mb-2 text-left">
      Totals by provider and queue
    </caption>
    <thead>
      <tr className="text-muted border-line border-b">
        <th scope="col" className="p-2">
          Provider
        </th>
        <th scope="col" className="p-2">
          Queue
        </th>
        <th scope="col" className="p-2 text-right">
          Attempts
        </th>
        <th scope="col" className="p-2 text-right">
          Succeeded
        </th>
        <th scope="col" className="p-2 text-right">
          Tokens in
        </th>
        <th scope="col" className="p-2 text-right">
          Tokens out
        </th>
        <th scope="col" className="p-2 text-right">
          Cost (USD)
        </th>
      </tr>
    </thead>
    <tbody className="divide-line divide-y">
      {rows.map((row) => (
        <tr key={`${row.provider}:${row.queue}`}>
          <th scope="row" className="p-2 font-mono font-normal">
            {row.provider}
          </th>
          <td className="p-2 font-mono">{row.queue}</td>
          <td className="p-2 text-right">{formatCount(row.attempts)}</td>
          <td className="p-2 text-right">{formatCount(row.succeeded)}</td>
          <td className="p-2 text-right">{formatCount(row.tokensIn)}</td>
          <td className="p-2 text-right">{formatCount(row.tokensOut)}</td>
          <td className="p-2 text-right">{formatUsd(row.costUsd)}</td>
        </tr>
      ))}
    </tbody>
  </table>
)
