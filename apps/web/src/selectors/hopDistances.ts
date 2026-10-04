// Breadth-first from `start` over allowed pages, up to `depth` steps, links
// followed either way (D10); each reached page maps to its step count.
export const hopDistances = (
  neighbours: readonly (readonly number[])[],
  allowed: readonly boolean[],
  start: number,
  depth: number,
): ReadonlyMap<number, number> => {
  const hops = new Map([[start, 0]])
  let frontier = [start]
  for (let step = 1; step <= depth; step += 1) {
    const next: number[] = []
    for (const node of frontier)
      for (const other of neighbours[node] ?? [])
        if (allowed[other] === true && !hops.has(other)) {
          hops.set(other, step)
          next.push(other)
        }
    frontier = next
  }
  return hops
}
