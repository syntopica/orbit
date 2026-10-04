import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { PageFiltersProps } from '../../types/PageFiltersProps'
import { readMaxLinks } from '../../validators/readMaxLinks'

// Orphans and index-like hubs are what turn a link graph into a hairball,
// so both can be left out of every view.
export const PageFilters = ({ brain }: PageFiltersProps) => (
  <fieldset className="flex flex-wrap items-center gap-3">
    <legend className="text-muted mb-1 text-xs">{BRAIN_LABELS.leaveOut}</legend>
    <label className="flex items-center gap-1.5">
      <input
        type="checkbox"
        checked={brain.search.hideOrphans}
        onChange={() => {
          brain.update({ hideOrphans: !brain.search.hideOrphans })
        }}
      />
      {BRAIN_LABELS.hideOrphans}
    </label>
    <label className="flex items-center gap-1.5">
      {BRAIN_LABELS.maxLinks}
      <input
        type="number"
        min={1}
        step={1}
        inputMode="numeric"
        placeholder={BRAIN_LABELS.noLimit}
        defaultValue={brain.search.maxLinks ?? ''}
        onChange={(event) => {
          brain.update({
            maxLinks: readMaxLinks(event.currentTarget.valueAsNumber),
          })
        }}
        className="border-line bg-space w-20 rounded-lg border px-2 py-1 font-mono text-sm"
      />
    </label>
  </fieldset>
)
