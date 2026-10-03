import { ACTIVITY_KEYS } from '../../charts/activityKeys'
import { formatBucketRange } from '../../formatters/formatBucketRange'
import { formatCount } from '../../formatters/formatCount'
import { formatCounts } from '../../formatters/formatCounts'
import { formatDuration } from '../../formatters/formatDuration'
import { ACTIVITY_LABELS } from '../../labels/activityLabels'
import type { ActivityTooltipProps } from '../../types/ActivityTooltipProps'
import { TooltipRows } from './TooltipRows'

export const ActivityTooltip = ({ column }: ActivityTooltipProps) => (
  <div className="w-max max-w-60 space-y-1.5">
    <p className="text-muted">{formatBucketRange(column.start, column.end)}</p>
    {column.total === 0 ? (
      <p className="text-muted">{ACTIVITY_LABELS.noActivity}</p>
    ) : (
      <TooltipRows entries={column.segments} keys={ACTIVITY_KEYS} />
    )}
    {column.failed > 0 && (
      <p className="text-muted font-mono wrap-break-word">
        {formatCounts(column.errors)}
      </p>
    )}
    <p className="text-muted">
      {column.meanWallMs === null
        ? null
        : `${ACTIVITY_LABELS.mean} ${formatDuration(column.meanWallMs)} · `}
      {formatCount(column.sampling)} {ACTIVITY_LABELS.sampling}
    </p>
  </div>
)
