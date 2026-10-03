import { usePageSearch } from '../../hooks/usePageSearch'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { PageSearchProps } from '../../types/PageSearchProps'

// D12: a native combobox over every page id; an exact id selects that page.
export const PageSearch = ({ model, select }: PageSearchProps) => {
  const { input, list } = usePageSearch()
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={input} className="text-muted text-xs">
        {BRAIN_LABELS.find}
      </label>
      <input
        id={input}
        type="search"
        list={list}
        autoComplete="off"
        onChange={(event) => {
          const value = event.currentTarget.value
          if (model.indexOf.has(value)) select(value)
        }}
        className="border-line bg-space rounded-lg border px-2 py-1 font-mono text-sm"
      />
      <datalist id={list}>
        {model.ids.map((id) => (
          <option key={id} value={id} />
        ))}
      </datalist>
    </div>
  )
}
