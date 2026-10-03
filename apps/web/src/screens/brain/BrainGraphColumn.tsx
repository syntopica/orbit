import { useMediaQuery } from '../../hooks/useMediaQuery'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { BrainBodyProps } from '../../types/BrainBodyProps'
import { GraphControls } from './GraphControls'
import { GraphLegend } from './GraphLegend'
import { GraphStage } from './GraphStage'
import { PageList } from './PageList'

export const BrainGraphColumn = ({ view, brain }: BrainBodyProps) => {
  const animate = !useMediaQuery('(prefers-reduced-motion: reduce)')
  const { search, select } = brain
  return (
    <div className="min-w-0 space-y-4">
      {view.model !== null ? (
        <GraphControls model={view.model} brain={brain} />
      ) : null}
      <section
        aria-label={BRAIN_LABELS.graphRegion}
        className="border-line bg-panel h-[60vh] overflow-hidden rounded-xl border md:h-[70vh]"
      >
        <GraphStage
          view={view}
          selectedId={view.selected === null ? null : (search.page ?? null)}
          select={select}
          animate={animate}
          depth={search.depth}
        />
      </section>
      {view.data !== null && view.data.skipped > 0 ? (
        <p className="text-muted text-sm">
          {view.data.skipped} {BRAIN_LABELS.skipped}
        </p>
      ) : null}
      {view.model !== null ? (
        <>
          <GraphLegend
            model={view.model}
            colorBy={search.color}
            communities={view.communities}
            highlightOrphans={search.orphans}
          />
          <PageList model={view.model} select={select} />
        </>
      ) : null}
    </div>
  )
}
