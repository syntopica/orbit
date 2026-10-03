// The bucket a row belongs to, or -1 when it falls outside the axis.
export const bucketIndex = (
  starts: readonly number[],
  bucketMs: number,
  bucket: number,
): number => {
  const first = starts[0]
  if (first === undefined) return -1
  const index = Math.floor((bucket - first) / bucketMs)
  return index >= 0 && index < starts.length ? index : -1
}
