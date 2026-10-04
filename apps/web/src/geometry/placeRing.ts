import type { RadialPoint } from '../types/RadialPoint'
import { RING_BAND_GAP } from './ringBandGap'
import { RING_SLOT } from './ringSlot'

// Spreads `ordered` evenly round a ring from `start`. Past one slot of
// circumference per page the ring staggers into concentric bands, so
// neighbours in angle alternate bands instead of overlapping. Returns the
// outer radius used.
export const placeRing = (
  ordered: readonly number[],
  radius: number,
  start: number,
  placed: Map<number, RadialPoint>,
): number => {
  const count = ordered.length
  const bands = Math.max(
    1,
    Math.ceil((count * RING_SLOT) / (2 * Math.PI * radius)),
  )
  ordered.forEach((node, index) => {
    const angle = start + (2 * Math.PI * index) / count
    const r = radius + (index % bands) * RING_BAND_GAP
    placed.set(node, { x: r * Math.cos(angle), y: r * Math.sin(angle), angle })
  })
  return radius + (bands - 1) * RING_BAND_GAP
}
