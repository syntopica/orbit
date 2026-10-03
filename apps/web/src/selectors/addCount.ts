export const addCount = (
  counts: Map<string, number>,
  key: string,
  count: number,
): void => {
  counts.set(key, (counts.get(key) ?? 0) + count)
}
