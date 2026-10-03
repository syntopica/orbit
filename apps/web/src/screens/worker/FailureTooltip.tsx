import { formatBucketRange } from '../../formatters/formatBucketRange'
import { formatCount } from '../../formatters/formatCount'
import type { FailureTooltipProps } from '../../types/FailureTooltipProps'
import { TooltipRows } from './TooltipRows'

export const FailureTooltip = ({ column, keys }: FailureTooltipProps) => (
  <div className="w-max max-w-60 space-y-1.5">
    <p className="text-muted">{formatBucketRange(column.start, column.end)}</p>
    {column.total === 0 ? (
      <p className="text-muted">{formatCount(0)}</p>
    ) : (
      <TooltipRows entries={column.segments} keys={keys} />
    )}
  </div>
)
