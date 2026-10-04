import type { RadialPoint } from '../types/RadialPoint'
import { anchorAngle } from './anchorAngle'

// A ring's pages by the direction of their branch, then by `tieBreak` (the
// community, so the first ring groups communities), then by index.
export const orderRing = (
  ring: readonly number[],
  neighbours: readonly (readonly number[])[],
  placed: ReadonlyMap<number, RadialPoint>,
  tieBreak: readonly number[],
): readonly number[] =>
  ring
    .map((node) => ({
      node,
      anchor: anchorAngle(neighbours[node] ?? [], placed),
      tie: tieBreak[node] ?? 0,
    }))
    .toSorted((a, b) => a.anchor - b.anchor || a.tie - b.tie || a.node - b.node)
    .map(({ node }) => node)
