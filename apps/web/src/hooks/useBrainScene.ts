import { useMemo } from 'react'

import { pageSlots } from '../selectors/pageSlots'
import { selectBrainScene } from '../selectors/selectBrainScene'
import type { BrainSceneInput } from '../types/BrainSceneInput'
import type { GraphScene } from '../types/GraphScene'

// The scene is rebuilt only when the model, layout, URL state or theme
// changes, never on hover.
export const useBrainScene = ({
  model,
  layout,
  search,
  palette,
  focus,
}: BrainSceneInput): GraphScene | null => {
  const slots = useMemo(
    () =>
      model === null || layout === null
        ? null
        : pageSlots(model, layout, search.color),
    [model, layout, search.color],
  )
  return useMemo(
    () =>
      model === null || layout === null || slots === null
        ? null
        : selectBrainScene(
            {
              model,
              layout,
              palette,
              slots,
              highlightOrphans: search.orphans,
              focus,
            },
            search,
          ),
    [model, layout, slots, palette, focus, search],
  )
}
