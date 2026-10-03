import { DEPTH_OPTIONS } from '../../charts/depthOptions'
import { useDepthControl } from '../../hooks/useDepthControl'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { DepthControlProps } from '../../types/DepthControlProps'

// D10: steps around a page need a selected page; the hint says so.
export const DepthControl = ({ hasSelection, brain }: DepthControlProps) => {
  const hint = useDepthControl()
  return (
    <fieldset>
      <legend className="text-muted mb-1 text-xs">{BRAIN_LABELS.view}</legend>
      <div className="flex flex-wrap gap-1">
        {DEPTH_OPTIONS.map(({ depth, label }) => (
          <button
            key={depth}
            type="button"
            aria-pressed={brain.search.depth === depth}
            aria-describedby={hasSelection ? undefined : hint}
            disabled={depth > 0 && !hasSelection}
            onClick={() => {
              brain.update({ depth })
            }}
            className="border-line aria-pressed:bg-space rounded-lg border px-2 py-1 text-sm disabled:opacity-50"
          >
            {label}
          </button>
        ))}
      </div>
      {hasSelection ? null : (
        <p id={hint} className="text-muted mt-1 text-xs">
          {BRAIN_LABELS.needsSelection}
        </p>
      )}
    </fieldset>
  )
}
