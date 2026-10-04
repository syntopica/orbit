import { LABELLED_NODES } from '../charts/labelledNodes'
import { radialLayout } from '../geometry/radialLayout'
import type { GraphScene } from '../types/GraphScene'
import type { SceneStyle } from '../types/SceneStyle'
import { aggregateEdges } from './aggregateEdges'
import { hopDistances } from './hopDistances'
import { mostLinked } from './mostLinked'
import { pageNode } from './pageNode'

// The local view: pages up to `depth` steps from the focus on rings. The
// focus and the most linked pages always wear labels; direct links do too
// while they are few. A hub with dozens of links would otherwise force every
// label at once and stack them; sigma's label grid and hover show the rest.
export const egoScene = (
  style: SceneStyle,
  allowed: readonly boolean[],
  depth: number,
): GraphScene => {
  const { model, focus } = style
  if (focus === null) return { nodes: [], edges: [] }
  const hops = hopDistances(model.neighbours, allowed, focus, depth)
  const points = radialLayout(hops, model.neighbours, style.layout.community)
  const top = mostLinked([...hops.keys()], model.degree, LABELLED_NODES)
  const ring = [...hops.values()].filter((hop) => hop === 1).length
  const labelRing = ring <= LABELLED_NODES ? 1 : 0
  return {
    nodes: [...points].map(([index, point]) =>
      pageNode(
        style,
        index,
        point,
        (hops.get(index) ?? 0) <= labelRing || top.has(index),
      ),
    ),
    edges: aggregateEdges(model.edges, (index) =>
      hops.has(index) ? (model.ids[index] ?? null) : null,
    ),
  }
}
