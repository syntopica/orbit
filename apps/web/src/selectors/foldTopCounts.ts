import type { CountEntry } from '../types/CountEntry'

// Largest first (ties by name); past `limit` the rest fold into "other".
export const foldTopCounts = (
  counts: ReadonlyMap<string, number>,
  limit: number,
): CountEntry[] => {
  const sorted = [...counts]
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({ key, count }))
    .toSorted((a, b) => b.count - a.count || a.key.localeCompare(b.key))
  if (sorted.length <= limit) return sorted
  const rest = sorted.slice(limit).reduce((sum, entry) => sum + entry.count, 0)
  return [...sorted.slice(0, limit), { key: 'other', count: rest }]
}
