import { UNTYPED } from '../../charts/untypedType'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import { toggleHidden } from '../../selectors/toggleHidden'
import type { TypeFilterProps } from '../../types/TypeFilterProps'

export const TypeFilter = ({ typeNames, brain }: TypeFilterProps) => (
  <fieldset className="flex flex-wrap gap-x-3 gap-y-1">
    <legend className="text-muted mb-1 text-xs">{BRAIN_LABELS.types}</legend>
    {typeNames.map((type) => (
      <label key={type} className="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={!brain.search.hide.includes(type)}
          onChange={() => {
            brain.update({ hide: toggleHidden(brain.search.hide, type) })
          }}
        />
        {type === UNTYPED ? BRAIN_LABELS.untyped : type}
      </label>
    ))}
  </fieldset>
)
