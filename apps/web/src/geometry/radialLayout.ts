import { groupRings } from '../selectors/groupRings'
import type { RadialPoint } from '../types/RadialPoint'
import { anchorAngle } from './anchorAngle'
import { orderRing } from './orderRing'
import { placeRing } from './placeRing'
import { RING_GAP } from './ringGap'

// Deterministic radial layout of a local view: the focus at the centre and
// each step out on its own ring, so distance reads as link distance.
export const radialLayout = (
  hops: ReadonlyMap<number, number>,
  neighbours: readonly (readonly number[])[],
  tieBreak: readonly number[],
): ReadonlyMap<number, RadialPoint> => {
  const placed = new Map<number, RadialPoint>()
  let outer = 0
  groupRings(hops).forEach((ring, hop) => {
    if (hop === 0) {
      for (const node of ring) placed.set(node, { x: 0, y: 0, angle: 0 })
      return
    }
    const ordered = orderRing(ring, neighbours, placed, tieBreak)
    const first = ordered[0] ?? 0
    const start = hop === 1 ? 0 : anchorAngle(neighbours[first] ?? [], placed)
    outer = placeRing(ordered, outer + RING_GAP, start, placed)
  })
  return placed
}
