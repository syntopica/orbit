// The series slot most members wear, the lowest on a tie.
export const dominantSlot = (
  members: readonly number[],
  slots: readonly number[],
): number => {
  const counts = new Map<number, number>()
  for (const member of members) {
    const slot = slots[member] ?? 6
    counts.set(slot, (counts.get(slot) ?? 0) + 1)
  }
  return [...counts].toSorted(([a, x], [b, y]) => y - x || a - b)[0]?.[0] ?? 6
}
