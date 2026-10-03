import { formatRate } from '../../formatters/formatRate'
import { FLOW_LABELS } from '../../labels/flowLabels'
import { FLOW_STAGE_LABELS } from '../../labels/flowStageLabels'
import type { StageEdgesProps } from '../../types/StageEdgesProps'

export const StageEdges = ({ edges }: StageEdgesProps) =>
  edges.length === 0 ? null : (
    <ul aria-label={FLOW_LABELS.flowsTo} className="space-y-1 text-sm">
      {edges.map((edge) => (
        <li key={edge.to} className="flex justify-between gap-3">
          <span>{FLOW_STAGE_LABELS[edge.to].title}</span>
          <span className="text-muted tabular-nums">
            {edge.perHour === null
              ? FLOW_LABELS.notMeasured
              : `${formatRate(edge.perHour)} ${FLOW_LABELS.perHour}`}
          </span>
        </li>
      ))}
    </ul>
  )
