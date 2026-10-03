import { formatTrendValue } from '../../formatters/formatTrendValue'
import type { TrendTooltipProps } from '../../types/TrendTooltipProps'

export const TrendTooltip = ({ lines, index, when }: TrendTooltipProps) => (
  <div className="space-y-0.5 whitespace-nowrap">
    {lines.map((line) => (
      <p key={line.key}>
        <strong className="text-ink font-semibold">
          {formatTrendValue(line.values[index])}
        </strong>{' '}
        <span className="text-muted">{line.label}</span>
      </p>
    ))}
    <p className="text-muted">{when}</p>
  </div>
)
