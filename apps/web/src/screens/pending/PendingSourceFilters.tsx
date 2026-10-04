import type { usePendingBoard } from '../../hooks/usePendingBoard'

export const PendingSourceFilters = ({
  model,
}: {
  model: ReturnType<typeof usePendingBoard>
}) => (
  <div className="flex flex-wrap gap-2">
    {model.query.data?.sources.map((source) => (
      <button
        key={source.id}
        type="button"
        aria-pressed={model.filters.source === source.id}
        onClick={() => {
          model.select('source', source.id)
        }}
        className="border-line aria-pressed:border-accent rounded-full border px-3 py-1 text-sm"
      >
        {source.name} {source.count}
      </button>
    ))}
  </div>
)
