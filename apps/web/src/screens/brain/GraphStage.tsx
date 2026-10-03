import { formatGraphSummary } from '../../formatters/formatGraphSummary'
import { useWebGl } from '../../hooks/useWebGl'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { GraphStageProps } from '../../types/GraphStageProps'
import { GraphCanvas } from './GraphCanvas'

// D12: the canvas is an image with a summary name; without WebGL or a layout
// the screen says why and the list below still reaches every page.
export const GraphStage = ({
  view,
  selectedId,
  select,
  animate,
  depth,
}: GraphStageProps) => {
  const available = useWebGl()
  if (!available)
    return (
      <p role="status" className="p-4 text-sm">
        {BRAIN_LABELS.noWebGl}
      </p>
    )
  if (view.layoutFailed)
    return (
      <p role="alert" className="p-4 text-sm">
        {BRAIN_LABELS.layoutFailed}
      </p>
    )
  if (view.graph === null || view.data === null)
    return <p className="text-muted p-4 text-sm">{BRAIN_LABELS.layingOut}</p>
  return (
    <div
      role="img"
      aria-label={formatGraphSummary(view.data)}
      className="pointer-events-auto size-full"
    >
      <GraphCanvas
        graph={view.graph}
        palette={view.palette}
        selectedId={selectedId}
        onSelect={select}
        animate={animate}
        depth={depth}
      />
    </div>
  )
}
