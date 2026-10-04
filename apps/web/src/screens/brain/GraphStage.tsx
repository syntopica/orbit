import { Suspense } from 'react'

import { formatGraphSummary } from '../../formatters/formatGraphSummary'
import { useWebGl } from '../../hooks/useWebGl'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { GraphStageProps } from '../../types/GraphStageProps'
import { GraphCanvas } from './GraphCanvas'
import { GraphScene3dLazy } from './GraphScene3dLazy'

// D12: the canvas is an image with a summary name; without WebGL or a layout
// the screen says why and the list below still reaches every page. 3D draws
// the same scene as 2D, in a lazily loaded chunk.
export const GraphStage = ({
  view,
  select,
  scene,
  animate,
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
  if (view.graph === null || view.scene === null || view.data === null)
    return <p className="text-muted p-4 text-sm">{BRAIN_LABELS.layingOut}</p>
  return (
    <div
      role="img"
      aria-label={formatGraphSummary(view.data)}
      className="pointer-events-auto size-full"
    >
      {scene === '3d' ? (
        <Suspense
          fallback={
            <p className="text-muted p-4 text-sm">{BRAIN_LABELS.loading3d}</p>
          }
        >
          <GraphScene3dLazy
            scene={view.scene}
            palette={view.palette}
            onSelect={select}
          />
        </Suspense>
      ) : (
        <GraphCanvas
          graph={view.graph}
          palette={view.palette}
          onSelect={select}
          animate={animate}
        />
      )}
    </div>
  )
}
