// The value below which `share` of the values fall, or 0 for none.
export const percentile3d = (
  values: readonly number[],
  share: number,
): number => {
  const sorted = values.toSorted((a, b) => a - b)
  return sorted[Math.floor((sorted.length - 1) * share)] ?? 0
}
