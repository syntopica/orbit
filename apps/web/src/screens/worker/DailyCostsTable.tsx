import { formatUsd } from '../../formatters/formatUsd'
import type { DailyCostsTableProps } from '../../types/DailyCostsTableProps'

export const DailyCostsTable = ({ rows }: DailyCostsTableProps) => (
  <table className="mb-4 w-full text-left text-xs tabular-nums">
    <caption className="text-muted mb-2 text-left">
      Daily cost by provider
    </caption>
    <thead>
      <tr className="text-muted border-line border-b">
        <th scope="col" className="p-2">
          Day (UTC)
        </th>
        <th scope="col" className="p-2">
          Provider
        </th>
        <th scope="col" className="p-2 text-right">
          Cost (USD)
        </th>
      </tr>
    </thead>
    <tbody className="divide-line divide-y">
      {rows.map((row) => (
        <tr key={`${String(row.day)}:${row.provider}`}>
          <th scope="row" className="p-2 font-normal">
            {new Date(row.day).toISOString().slice(0, 10)}
          </th>
          <td className="p-2 font-mono">{row.provider}</td>
          <td className="p-2 text-right">{formatUsd(row.costUsd)}</td>
        </tr>
      ))}
    </tbody>
  </table>
)
