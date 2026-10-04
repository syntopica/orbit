import { formatUsd } from '../../formatters/formatUsd'
import type { CostTooltipProps } from '../../types/CostTooltipProps'

export const CostTooltip = ({ column }: CostTooltipProps) => (
  <div className="space-y-1">
    <p>
      {new Date(column.start).toLocaleDateString('en-GB', { timeZone: 'UTC' })}
    </p>
    {column.segments.map((entry) => (
      <p key={entry.key}>
        <span className="font-mono">{entry.key}</span> {formatUsd(entry.count)}
      </p>
    ))}
    <p>
      {column.attempts} attempts · {formatUsd(column.total)}
    </p>
  </div>
)
