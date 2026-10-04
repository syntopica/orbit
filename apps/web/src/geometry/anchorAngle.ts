import type { RadialPoint } from '../types/RadialPoint'

// The mean direction of the already placed pages next to a page, so it sits
// on its ring next to the branch it hangs from; 0 when none is placed.
export const anchorAngle = (
  adjacent: readonly number[],
  placed: ReadonlyMap<number, RadialPoint>,
): number => {
  let sin = 0
  let cos = 0
  for (const node of adjacent) {
    const point = placed.get(node)
    if (point !== undefined) {
      sin += Math.sin(point.angle)
      cos += Math.cos(point.angle)
    }
  }
  return Math.atan2(sin, cos)
}
