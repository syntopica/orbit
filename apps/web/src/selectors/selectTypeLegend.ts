import { typeSlots } from '../charts/typeSlots'
import type { TypeLegendEntry } from '../types/TypeLegendEntry'

// One entry per type in slots 1-5, then one for every type sharing slot 6.
export const selectTypeLegend = (
  types: readonly string[],
): TypeLegendEntry[] => {
  const slots = typeSlots(types)
  const named = [...slots]
    .filter(([, slot]) => slot < 6)
    .map(([name, slot]) => ({
      name,
      slot,
      count: types.filter((type) => type === name).length,
    }))
  const folded = types.filter((type) => (slots.get(type) ?? 6) === 6).length
  return folded === 0
    ? named
    : [...named, { name: null, slot: 6, count: folded }]
}
