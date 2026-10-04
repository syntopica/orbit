import type { LabelRect3d } from '../types/LabelRect3d'
import { rectsOverlap3d } from './rectsOverlap3d'

// Which labels to show, given their boxes in priority order: each one is shown
// unless it would cover a label already shown; a missing box (behind the
// camera) is hidden.
export const clearLabels3d = (
  rects: readonly (LabelRect3d | null)[],
): boolean[] => {
  const shown: LabelRect3d[] = []
  return rects.map((rect) => {
    if (rect === null || shown.some((kept) => rectsOverlap3d(rect, kept)))
      return false
    shown.push(rect)
    return true
  })
}
