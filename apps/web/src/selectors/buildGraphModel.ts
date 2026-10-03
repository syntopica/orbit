import type { BrainGraph } from '@orbit/contract'

import { UNTYPED } from '../charts/untypedType'
import type { GraphModel } from '../types/GraphModel'

// Neighbours ignore link direction and self-links (D10).
export const buildGraphModel = (graph: BrainGraph): GraphModel => {
  const ids = graph.nodes.map((node) => node.id)
  const types = graph.nodes.map((node) => node.type ?? UNTYPED)
  const neighbours = ids.map(() => new Set<number>())
  for (const [source, target] of graph.edges) {
    if (source !== target) {
      neighbours[source]?.add(target)
      neighbours[target]?.add(source)
    }
  }
  return {
    ids,
    types,
    degree: graph.nodes.map((node) => node.degree),
    orphan: graph.nodes.map((node) => node.orphan),
    edges: graph.edges,
    neighbours: neighbours.map((set) => [...set].toSorted((a, b) => a - b)),
    typeNames: [...new Set(types)].toSorted((a, b) => a.localeCompare(b)),
    indexOf: new Map(ids.map((id, index) => [id, index])),
  }
}
