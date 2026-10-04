import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { GraphControlsProps } from '../../types/GraphControlsProps'
import { DepthControl } from './DepthControl'
import { PageSearch } from './PageSearch'
import { TypeFilter } from './TypeFilter'

// Floats over the canvas from lg up, so it folds away to show the graph.
export const GraphControls = ({ model, brain }: GraphControlsProps) => (
  <details
    open
    className="group border-line bg-panel lg:bg-panel/90 rounded-xl border text-sm lg:shadow-lg lg:backdrop-blur"
  >
    <summary className="cursor-pointer px-4 py-2.5 font-semibold">
      {BRAIN_LABELS.filters}
    </summary>
    <section
      aria-label={BRAIN_LABELS.controls}
      className="grid gap-4 px-4 pb-4 md:grid-cols-2 lg:grid-cols-1"
    >
      <PageSearch model={model} select={brain.select} />
      <DepthControl
        hasSelection={brain.search.page !== undefined}
        brain={brain}
      />
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
      <TypeFilter typeNames={model.typeNames} brain={brain} />
    </section>
  </details>
)
