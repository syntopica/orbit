import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { GraphControlsProps } from '../../types/GraphControlsProps'
import { PageFilters } from './PageFilters'
import { TypeFilter } from './TypeFilter'

// Colour mode and the filters, folded by default.
export const GraphFilters = ({ model, brain }: GraphControlsProps) => (
  <details className="md:col-span-2 lg:col-span-1">
    <summary className="cursor-pointer py-1 font-semibold">
      {BRAIN_LABELS.filters}
    </summary>
    <div className="mt-2 grid gap-3">
      <fieldset className="flex flex-wrap items-center gap-3">
        <legend className="text-muted mb-1 text-xs">
          {BRAIN_LABELS.colorBy}
        </legend>
        {(['type', 'community'] as const).map((color) => (
          <label key={color} className="flex items-center gap-1.5">
            <input
              type="radio"
              name="brain-colour"
              checked={brain.search.color === color}
              onChange={() => {
                brain.update({ color })
              }}
            />
            {color === 'type' ? BRAIN_LABELS.byType : BRAIN_LABELS.byCommunity}
          </label>
        ))}
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={brain.search.orphans}
            onChange={() => {
              brain.update({ orphans: !brain.search.orphans })
            }}
          />
          {BRAIN_LABELS.highlightOrphans}
        </label>
      </fieldset>
      <PageFilters brain={brain} />
      <TypeFilter typeNames={model.typeNames} brain={brain} />
    </div>
  </details>
)
