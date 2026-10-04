import { edgeSize } from '../charts/edgeSize'
import type { SceneEdge } from '../types/SceneEdge'

// Each link between two drawn nodes once, whichever way it points; links
// folded into the same pair of drawn nodes add up. `drawnAs` names the node
// a page is drawn as, or null when the page is not drawn.
export const aggregateEdges = (
  edges: readonly (readonly [number, number])[],
  drawnAs: (index: number) => string | null,
): readonly SceneEdge[] => {
  const counts = new Map<
    string,
    { source: string; target: string; n: number }
  >()
  for (const [from, to] of edges) {
    const a = drawnAs(from)
    const b = drawnAs(to)
    if (a === null || b === null || a === b) continue
    const [source, target] = a < b ? [a, b] : [b, a]
    const key = `${source}\n${target}`
    counts.set(key, { source, target, n: (counts.get(key)?.n ?? 0) + 1 })
  }
  return [...counts.values()].map(({ source, target, n }) => ({
    source,
    target,
    size: edgeSize(n),
  }))
}
