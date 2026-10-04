import type { Coordinates } from 'sigma/types'

import { nodeColor } from '../charts/nodeColor'
import { nodeSize } from '../charts/nodeSize'
import type { SceneNode } from '../types/SceneNode'
import type { SceneStyle } from '../types/SceneStyle'

// A page as drawn: sized by degree (D8), coloured by its slot, the orphan
// highlight or, for the focus, the accent (D7).
export const pageNode = (
  style: SceneStyle,
  index: number,
  point: Coordinates,
  forceLabel: boolean,
): SceneNode => {
  const id = style.model.ids[index] ?? ''
  return {
    id,
    label: id,
    x: point.x,
    y: point.y,
    size: nodeSize(style.model.degree[index] ?? 0),
    color: nodeColor(
      {
        slot: style.slots[index] ?? 6,
        orphan: style.model.orphan[index] === true,
        selected: style.focus === index,
        highlightOrphans: style.highlightOrphans,
      },
      style.palette,
    ),
    forceLabel,
  }
}
