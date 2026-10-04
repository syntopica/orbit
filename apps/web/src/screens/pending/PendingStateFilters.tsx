import type { usePendingBoard } from '../../hooks/usePendingBoard'

export const PendingStateFilters = ({
  model,
}: {
  model: ReturnType<typeof usePendingBoard>
}) => {
  const states = [
    'blocked',
    'partial',
    'open',
    'issue',
    'failed',
    'waiting',
  ] as const
  return (
    <div className="flex flex-wrap gap-2">
      {states.map((state) => (
        <button
          key={state}
          type="button"
          aria-pressed={model.filters.state === state}
          onClick={() => {
            model.select('state', state)
          }}
          className="border-line aria-pressed:border-accent rounded-full border px-3 py-1 text-sm"
        >
          {state}{' '}
          {model.query.data?.items.filter((item) => item.state === state)
            .length ?? 0}
        </button>
      ))}
    </div>
  )
}
