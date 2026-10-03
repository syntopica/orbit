// D7: keys ranked by how often they occur (ties by `compare`) take series
// slots 1-5; every later key shares slot 6.
export const rankSlots = <K>(
  keys: readonly K[],
  compare: (a: K, b: K) => number,
): ReadonlyMap<K, number> => {
  const counts = new Map<K, number>()
  for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1)
  const ranked = [...counts].toSorted(
    ([a, countA], [b, countB]) => countB - countA || compare(a, b),
  )
  return new Map(ranked.map(([key], index) => [key, Math.min(index + 1, 6)]))
}
