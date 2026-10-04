import type { usePendingBoard } from '../../hooks/usePendingBoard'
import { PendingSearchInput } from './PendingSearchInput'
import { PendingSourceFilters } from './PendingSourceFilters'
import { PendingStateFilters } from './PendingStateFilters'

export const PendingFilters = ({
  model,
}: {
  model: ReturnType<typeof usePendingBoard>
}) => {
  if (model.query.data === undefined) return null
  return (
    <section aria-label="Pending filters" className="space-y-3">
      <PendingStateFilters model={model} />
      <PendingSourceFilters model={model} />
      <PendingSearchInput model={model} />
    </section>
  )
}
