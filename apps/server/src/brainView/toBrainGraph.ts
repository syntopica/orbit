import type { BrainGraph } from '@orbit/contract'

import type { BrainGraphDocument } from '../types/BrainGraphDocument'
import { identifierOrNull } from '../workerView/identifierOrNull'
import { isPageId } from './isPageId'

// D4: nodes whose ids fail the pattern are left out with their edges and
// counted; edges become index pairs; dangling links are a count only.
export const toBrainGraph = (
  doc: BrainGraphDocument,
  now: number,
): BrainGraph => {
  const kept = doc.nodes.filter((node) => isPageId(node.id))
  const index = new Map(kept.map((node, position) => [node.id, position]))
  const orphans = new Set(doc.orphans)
  const edges = doc.edges.flatMap(({ source, target }) => {
    const from = index.get(source)
    const to = index.get(target)
    return from === undefined || to === undefined
      ? []
      : [[from, to] as [number, number]]
  })
  return {
    now,
    nodes: kept.map((node) => ({
      id: node.id,
      type: identifierOrNull(node.type),
      degree: node.degree,
      orphan: orphans.has(node.id),
    })),
    edges,
    dangling: doc.dangling.length,
    skipped: doc.nodes.length - kept.length,
  }
}
