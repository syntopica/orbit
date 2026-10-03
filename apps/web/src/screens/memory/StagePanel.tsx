import { FLOW_LABELS } from '../../labels/flowLabels'
import { FLOW_STAGE_LABELS } from '../../labels/flowStageLabels'
import type { StagePanelProps } from '../../types/StagePanelProps'
import { StageEdges } from './StageEdges'
import { StageFacts } from './StageFacts'
import { StageValues } from './StageValues'

export const StagePanel = ({ stage, flow, onClose }: StagePanelProps) => {
  const { title, explanation } = FLOW_STAGE_LABELS[stage.id]
  return (
    <aside
      id={`stage-panel-${stage.id}`}
      aria-label={title}
      className="border-line bg-panel space-y-4 rounded-xl border p-4"
    >
      <header className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-ink text-sm"
        >
          {FLOW_LABELS.close}
        </button>
      </header>
      <p className="text-sm">{explanation}</p>
      <StageFacts stage={stage} now={flow.now} />
      <StageValues stage={stage} now={flow.now} />
      <StageEdges edges={flow.edges.filter((e) => e.from === stage.id)} />
    </aside>
  )
}
