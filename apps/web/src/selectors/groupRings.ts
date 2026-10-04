// Pages grouped by step count: ring 0 holds the focus. Index order within a
// ring keeps the grouping deterministic.
export const groupRings = (
  hops: ReadonlyMap<number, number>,
): readonly (readonly number[])[] => {
  const rings: number[][] = []
  for (const [node, hop] of [...hops].toSorted(([a], [b]) => a - b))
    (rings[hop] ??= []).push(node)
  return rings
}
