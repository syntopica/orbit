// The `count` most linked of `members` (ties by index), as a set.
export const mostLinked = (
  members: readonly number[],
  degree: readonly number[],
  count: number,
): ReadonlySet<number> =>
  new Set(
    members
      .toSorted((a, b) => (degree[b] ?? 0) - (degree[a] ?? 0) || a - b)
      .slice(0, count),
  )
