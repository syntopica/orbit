import { SERIES_SWATCHES } from '../../charts/seriesSwatches'
import { formatCount } from '../../formatters/formatCount'
import { formatTypeName } from '../../formatters/formatTypeName'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import { selectTypeLegend } from '../../selectors/selectTypeLegend'
import type { LegendSwatchesProps } from '../../types/LegendSwatchesProps'

// Every colour on the canvas, named (spec 7.1).
export const LegendSwatches = ({
  model,
  colorBy,
  communities,
  highlightOrphans,
}: LegendSwatchesProps) => (
  <ul className="flex flex-wrap gap-x-4 gap-y-1">
    {colorBy === 'type' ? (
      selectTypeLegend(model.types).map((entry) => (
        <li key={entry.name ?? '(other)'} className="flex items-center gap-1.5">
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
)
