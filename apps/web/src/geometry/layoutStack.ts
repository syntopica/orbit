import type { CountEntry } from '../types/CountEntry'
import type { StackRect } from '../types/StackRect'

// Segments bottom to top with a 2 px surface gap between them; only the top
// segment gets the rounded data end. A non-zero segment stays at least 1 px.
export const layoutStack = (
  segments: readonly CountEntry[],
  y: (value: number) => number,
): StackRect[] => {
  let below = 0
  return segments.map((segment, i) => {
    const bottom = y(below) - (i === 0 ? 0 : 2)
    below += segment.count
    const top = y(below)
    const height = Math.max(1, bottom - top)
    return {
      key: segment.key,
      y: bottom - height,
      height,
      rounded: i === segments.length - 1,
    }
  })
}
