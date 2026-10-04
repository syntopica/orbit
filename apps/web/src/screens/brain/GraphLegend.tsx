import { SERIES_SWATCHES } from '../../charts/seriesSwatches'
import { formatCount } from '../../formatters/formatCount'
import { formatTypeName } from '../../formatters/formatTypeName'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import { selectTypeLegend } from '../../selectors/selectTypeLegend'
import type { GraphLegendProps } from '../../types/GraphLegendProps'

// Every colour on the canvas is named here (spec 7.1: status colours always
// carry a label).
export const GraphLegend = ({
  model,
  colorBy,
  communities,
  highlightOrphans,
  skipped,
}: GraphLegendProps) => (
  <section
    aria-label={BRAIN_LABELS.legend}
    className="lg:border-line lg:bg-panel/90 space-y-1 text-sm lg:rounded-lg lg:border lg:px-3 lg:py-2 lg:shadow-lg lg:backdrop-blur"
  >
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {colorBy === 'type' ? (
        selectTypeLegend(model.types).map((entry) => (
          <li
            key={entry.name ?? '(other)'}
            className="flex items-center gap-1.5"
          >
            <span
              aria-hidden="true"
              className={`size-2.5 rounded-full ${SERIES_SWATCHES[entry.slot - 1] ?? 'bg-series-6'}`}
            />
            {formatTypeName(entry.name)}
            <span className="text-muted">{formatCount(entry.count)}</span>
          </li>
        ))
      ) : (
        <li>
          {formatCount(communities)} {BRAIN_LABELS.communities}
        </li>
      )}
      {highlightOrphans ? (
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="bg-warn size-2.5 rounded-full" />
          {BRAIN_LABELS.orphan}
        </li>
      ) : null}
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="bg-accent size-2.5 rounded-full" />
        {BRAIN_LABELS.selected}
      </li>
    </ul>
    {skipped > 0 ? (
      <p className="text-muted">
        {skipped} {BRAIN_LABELS.skipped}
      </p>
    ) : null}
  </section>
)
