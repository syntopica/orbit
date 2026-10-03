export const meanOrNull = (sum: number, count: number): number | null =>
  count === 0 ? null : sum / count
