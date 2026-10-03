import { formatCount } from '../../formatters/formatCount'
import { formatDuration } from '../../formatters/formatDuration'
import { FLOW_LABELS } from '../../labels/flowLabels'
import { METRIC_LABELS } from '../../labels/metricLabels'
import { PENDING_LABELS } from '../../labels/pendingLabels'
import type { StagePartProps } from '../../types/StagePartProps'

export const StageValues = ({ stage, now }: StagePartProps) => (
  <>
    {stage.metrics.length === 0 ? null : (
      <ul aria-label={FLOW_LABELS.metrics} className="space-y-1 text-sm">
        {stage.metrics.map((m) => (
          <li key={m.key} className="flex justify-between gap-3">
            <span>{METRIC_LABELS[m.key]}</span>
            <span className="tabular-nums">{formatCount(m.value)}</span>
          </li>
        ))}
      </ul>
    )}
    {stage.pending.length === 0 ? null : (
      <ul aria-label={FLOW_LABELS.pending} className="space-y-1 text-sm">
        {stage.pending.map((p) => (
          <li key={p.key}>
            {formatCount(p.count)} {PENDING_LABELS[p.key]}
            {p.oldestAt === null
              ? ''
              : `, ${FLOW_LABELS.oldest} ${formatDuration(now - p.oldestAt)}`}
          </li>
        ))}
      </ul>
    )}
  </>
)
