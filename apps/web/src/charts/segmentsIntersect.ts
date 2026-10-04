import type { Point } from '../types/Point'

// Shared endpoints are joins, not crossings.
export const segmentsIntersect = (
  a: Point,
  b: Point,
  c: Point,
  d: Point,
): boolean => {
  const abc = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
  const abd = (b.x - a.x) * (d.y - a.y) - (b.y - a.y) * (d.x - a.x)
  const cda = (d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)
  const cdb = (d.x - c.x) * (b.y - c.y) - (d.y - c.y) * (b.x - c.x)
  return abc * abd < 0 && cda * cdb < 0
}
