import type { usePendingBoard } from '../../hooks/usePendingBoard'

export const PendingGroupToggle = ({
  model,
}: {
  model: ReturnType<typeof usePendingBoard>
}) => (
  <div className="flex items-center justify-between gap-3">
    <p className="text-muted text-sm">{model.items.length} items</p>
    <button
      type="button"
      className="border-line rounded-lg border px-3 py-2 text-sm"
      onClick={() => {
        model.groups.setAll(!model.groups.allOpen)
      }}
    >
      {model.groups.allOpen ? 'Collapse all' : 'Expand all'}
    </button>
  </div>
)
