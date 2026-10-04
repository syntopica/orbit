import { formatCount } from '../../formatters/formatCount'
import { formatUsd } from '../../formatters/formatUsd'
import type { CostStatsProps } from '../../types/CostStatsProps'

export const CostStats = ({ totals }: CostStatsProps) => (
  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {(
      [
        ['Attempts', formatCount(totals.attempts)],
        ['Tokens in', formatCount(totals.tokensIn)],
        ['Tokens out', formatCount(totals.tokensOut)],
        ['Cost (USD)', formatUsd(totals.costUsd)],
      ] as const
    ).map(([label, value]) => (
      <div key={label} className="border-line bg-panel rounded-xl border p-3">
        <dt className="text-muted text-xs">{label}</dt>
        <dd className="text-xl font-semibold tabular-nums">{value}</dd>
      </div>
    ))}
  </dl>
)
