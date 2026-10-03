import { formatCount } from '../../formatters/formatCount'
import { formatStageName } from '../../formatters/formatStageName'
import { FLOW_STAGE_LABELS } from '../../labels/flowStageLabels'
import { METRIC_LABELS } from '../../labels/metricLabels'
import type { StageButtonProps } from '../../types/StageButtonProps'
import { StateBadge } from './StateBadge'

// Pressing the selected stage again closes its panel.
export const StageButton = ({
  stage,
  selected,
  onSelect,
  buttonRef,
}: StageButtonProps) => (
  <button
    ref={buttonRef}
    type="button"
    aria-expanded={selected}
    aria-controls={selected ? `stage-panel-${stage.id}` : undefined}
    aria-pressed={selected}
    aria-label={formatStageName(stage)}
    onClick={() => {
      onSelect(selected ? null : stage.id)
    }}
    className="border-line bg-panel hover:border-muted aria-pressed:border-accent flex w-full flex-col items-start gap-1 rounded-xl border p-3 text-left"
  >
    <span className="font-medium">{FLOW_STAGE_LABELS[stage.id].title}</span>
    <StateBadge state={stage.state} />
    {stage.backlog === null ? null : (
      <span className="text-muted text-xs tabular-nums">
        {formatCount(stage.backlog.value)} {METRIC_LABELS[stage.backlog.key]}
      </span>
    )}
  </button>
)
