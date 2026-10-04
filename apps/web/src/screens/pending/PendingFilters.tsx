import type { usePendingBoard } from '../../hooks/usePendingBoard'
import { PendingSearchInput } from './PendingSearchInput'
import { PendingSourceFilters } from './PendingSourceFilters'
import { PendingStateFilters } from './PendingStateFilters'

// Search first; the per-source chips stay folded unless one is selected.
export const PendingFilters = ({
  model,
}: {
  model: ReturnType<typeof usePendingBoard>
}) => {
  if (model.query.data === undefined) return null
  return (
    <section aria-label="Pending filters" className="space-y-3">
      <PendingSearchInput model={model} />
      <PendingStateFilters model={model} />
      <details
        open={model.filters.source !== undefined}
        className="group/sources"
      >
        <summary className="text-muted cursor-pointer text-sm">
          Sources ({model.query.data.sources.length})
        </summary>
        <div className="pt-2">
          <PendingSourceFilters model={model} />
        </div>
      </details>
    </section>
  )
}
