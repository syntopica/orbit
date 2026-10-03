import type { TrendSlot } from '../types/TrendSlot'

// Series slots in a fixed order (spec 7.1); literal classes for Tailwind.
export const trendSlot = (index: number): TrendSlot => {
  const slots = [
    { stroke: 'stroke-series-1', dot: 'fill-series-1', swatch: 'bg-series-1' },
    { stroke: 'stroke-series-2', dot: 'fill-series-2', swatch: 'bg-series-2' },
    { stroke: 'stroke-series-3', dot: 'fill-series-3', swatch: 'bg-series-3' },
  ] as const
  return slots[index % slots.length] ?? slots[0]
}
