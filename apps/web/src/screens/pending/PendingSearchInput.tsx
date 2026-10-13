import type { PendingSearchInputProps } from '../../types/PendingSearchInputProps'

export const PendingSearchInput = ({ model }: PendingSearchInputProps) => (
  <label className="block space-y-1 text-sm">
    <span>Search title and detail</span>
    <input
      type="search"
      value={model.filters.q ?? ''}
      onChange={(event) => {
        model.select('q', event.target.value)
      }}
      className="border-line bg-panel w-full rounded-lg border px-3 py-2 text-base md:text-sm"
    />
  </label>
)
