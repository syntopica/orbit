import { useMediaQuery } from '../../hooks/useMediaQuery'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { BrainBodyProps } from '../../types/BrainBodyProps'
import { FloatingPagePanel } from './FloatingPagePanel'
import { GraphControls } from './GraphControls'
import { GraphLegend } from './GraphLegend'
import { GraphStage } from './GraphStage'

// Always mounted, so a selected page keeps its panel while the graph loads.
// From lg up the canvas fills the frame and controls, legend and the selected
// page float over it; below lg they stack under a shorter canvas, the selected
// page first so it sits right below the node that was tapped.
export const BrainGraphColumn = ({ view, brain }: BrainBodyProps) => {
  const animate = !useMediaQuery('(prefers-reduced-motion: reduce)')
  const { search, select } = brain
  return (
    <div
      data-framed={view.data !== null}
      className="group relative flex min-w-0 flex-col gap-4 lg:block lg:space-y-4 lg:data-[framed=true]:h-[calc(100dvh-8.5rem)] lg:data-[framed=true]:min-h-144 lg:data-[framed=true]:space-y-0"
    >
      {view.data === null ? null : (
        <section
          aria-label={BRAIN_LABELS.graphRegion}
          className="border-line bg-panel order-1 h-[60vh] overflow-hidden rounded-xl border lg:absolute lg:inset-0 lg:h-auto"
        >
          <GraphStage
            view={view}
            selectedId={view.selected === null ? null : (search.page ?? null)}
            select={select}
            animate={animate}
            depth={search.depth}
          />
        </section>
      )}
      {view.model !== null ? (
        <div className="order-4 lg:absolute lg:top-3 lg:left-3 lg:w-96">
          <GraphControls model={view.model} brain={brain} />
        </div>
      ) : null}
      {view.model !== null ? (
        <div className="order-3 lg:absolute lg:bottom-3 lg:left-3 lg:max-w-[calc(100%-29rem)]">
          <GraphLegend
            model={view.model}
            colorBy={search.color}
            communities={view.communities}
            highlightOrphans={search.orphans}
            skipped={view.data?.skipped ?? 0}
          />
        </div>
      ) : null}
      {search.page === undefined ? null : (
        <FloatingPagePanel
          key={search.page}
          id={search.page}
          search={search}
          select={select}
        />
      )}
    </div>
  )
}
