// Breadth-first from `start`, up to `depth` steps, the start included.
export const neighbourhood = (
  neighbours: readonly (readonly number[])[],
  start: number,
  depth: number,
): ReadonlySet<number> => {
  const seen = new Set([start])
  let frontier = [start]
  for (let step = 0; step < depth; step += 1) {
    frontier = frontier.flatMap((node) =>
      (neighbours[node] ?? []).filter((next) => !seen.has(next)),
    )
    for (const node of frontier) seen.add(node)
  }
  return seen
}
