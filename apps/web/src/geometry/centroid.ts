import type { Coordinates } from 'sigma/types'

import type { LayoutResult } from '../types/LayoutResult'

// The mean layout position of `members`; the origin for none.
export const centroid = (
  members: readonly number[],
  layout: LayoutResult,
): Coordinates => {
  if (members.length === 0) return { x: 0, y: 0 }
  let x = 0
  let y = 0
  for (const member of members) {
    x += layout.x[member] ?? 0
    y += layout.y[member] ?? 0
  }
  return { x: x / members.length, y: y / members.length }
}
