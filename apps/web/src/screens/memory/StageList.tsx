import { FLOW_LABELS } from '../../labels/flowLabels'
import type { StageListProps } from '../../types/StageListProps'
import { StageListItem } from './StageListItem'

// The flow in stage order (spec 3.3), for phones (D12).
export const StageList = ({
  stages,
  selectedId,
  onSelect,
  flow,
}: StageListProps) => (
  <ol aria-label={FLOW_LABELS.stages} className="space-y-2">
    {stages.map((stage) => (
      <StageListItem
        key={stage.id}
        flow={flow}
        stage={stage}
        selected={stage.id === selectedId}
        onSelect={onSelect}
      />
    ))}
  </ol>
)
