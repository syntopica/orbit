import type { CountEntry } from '../types/CountEntry'

// Non-zero counts in a fixed key order (stack order, legend order).
export const orderedCounts = (
  counts: ReadonlyMap<string, number>,
  order: readonly string[],
): CountEntry[] =>
  order
    .map((key) => ({ key, count: counts.get(key) ?? 0 }))
    .filter((entry) => entry.count > 0)
