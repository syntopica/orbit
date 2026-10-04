import { CONTEXT_LABELS } from '../../labels/contextLabels'
import type { ContextFormProps } from '../../types/ContextFormProps'

export const ContextForm = ({ model }: ContextFormProps) => (
  <form onSubmit={model.submit} className="flex flex-wrap items-end gap-3">
    <label className="text-muted flex min-w-0 flex-1 flex-col gap-1 text-xs">
      <span>{CONTEXT_LABELS.query}</span>
      <input
        type="search"
        autoComplete="off"
        maxLength={model.max}
        value={model.query}
        aria-describedby={model.countId}
        onChange={(event) => {
          model.setQuery(event.target.value)
        }}
        className="border-line bg-space text-ink rounded-lg border px-3 py-2 text-sm"
      />
    </label>
    <button
      type="submit"
      disabled={model.status === 'loading' || model.query.trim() === ''}
      className="bg-accent text-space rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50"
    >
      {CONTEXT_LABELS.submit}
    </button>
    <p id={model.countId} className="text-muted w-full text-xs">
      {model.query.length} / {model.max} {CONTEXT_LABELS.characters}
    </p>
  </form>
)
