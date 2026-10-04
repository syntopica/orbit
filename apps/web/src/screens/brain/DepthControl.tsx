import { DEPTH_OPTIONS } from '../../charts/depthOptions'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { DepthControlProps } from '../../types/DepthControlProps'

// The overview or 1-3 steps around the focus page; keys do the same.
export const DepthControl = ({ brain }: DepthControlProps) => (
  <fieldset>
    <legend className="text-muted mb-1 text-xs">{BRAIN_LABELS.view}</legend>
    <div className="flex flex-wrap gap-1">
      {DEPTH_OPTIONS.map(({ depth, label }) => (
        <button
          key={depth}
          type="button"
          aria-pressed={brain.search.depth === depth}
          aria-keyshortcuts={String(depth)}
          onClick={() => {
            brain.update({ depth })
          }}
          className="border-line aria-pressed:border-accent aria-pressed:bg-space hover:bg-space focus-visible:outline-accent cursor-pointer rounded-lg border px-2 py-1 text-sm transition-colors aria-pressed:font-semibold"
        >
          {label}
        </button>
      ))}
    </div>
    <p className="text-muted mt-1 text-xs">{BRAIN_LABELS.keysHint}</p>
  </fieldset>
)
