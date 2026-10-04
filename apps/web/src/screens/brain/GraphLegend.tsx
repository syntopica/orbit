import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { GraphLegendProps } from '../../types/GraphLegendProps'
import { LegendSwatches } from './LegendSwatches'

// Every colour on the canvas is named here (spec 7.1: status colours always
// carry a label), under a line that says what the canvas shows.
export const GraphLegend = ({
  model,
  colorBy,
  communities,
  highlightOrphans,
  skipped,
  caption,
  overview,
}: GraphLegendProps) => (
  <section
    aria-label={BRAIN_LABELS.legend}
    className="lg:border-line lg:bg-panel/90 space-y-1 text-sm lg:rounded-lg lg:border lg:px-3 lg:py-2 lg:shadow-lg lg:backdrop-blur"
  >
    <p aria-live="polite" className="font-medium">
      {caption}
    </p>
    <LegendSwatches
      model={model}
      colorBy={colorBy}
      communities={communities}
      highlightOrphans={highlightOrphans}
    />
    {overview ? <p className="text-muted">{BRAIN_LABELS.groupHint}</p> : null}
    {skipped > 0 ? (
      <p className="text-muted">
        {skipped} {BRAIN_LABELS.skipped}
      </p>
    ) : null}
  </section>
)
