import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { SceneToggleProps } from '../../types/SceneToggleProps'

// 3D is opt-in and draws the same scene; 2D stays the default.
export const SceneToggle = ({ brain }: SceneToggleProps) => (
  <fieldset>
    <legend className="text-muted mb-1 text-xs">{BRAIN_LABELS.drawing}</legend>
    <div className="flex gap-1">
      {(['2d', '3d'] as const).map((scene) => (
        <button
          key={scene}
          type="button"
          aria-pressed={brain.search.scene === scene}
          onClick={() => {
            brain.update({ scene })
          }}
          className="border-line aria-pressed:border-accent aria-pressed:bg-space hover:bg-space cursor-pointer rounded-lg border px-2 py-1 text-sm transition-colors aria-pressed:font-semibold"
        >
          {scene === '2d' ? BRAIN_LABELS.flat : BRAIN_LABELS.depth3d}
        </button>
      ))}
    </div>
  </fieldset>
)
