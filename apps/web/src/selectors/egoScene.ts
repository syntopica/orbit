import { LABELLED_NODES } from '../charts/labelledNodes'
import { radialLayout } from '../geometry/radialLayout'
import type { GraphScene } from '../types/GraphScene'
import type { SceneStyle } from '../types/SceneStyle'
import { aggregateEdges } from './aggregateEdges'
import { hopDistances } from './hopDistances'
import { mostLinked } from './mostLinked'
import { pageNode } from './pageNode'

// The local view: pages up to `depth` steps from the focus on rings. The
// focus, its direct links and the most linked pages always wear labels.
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
  return {
    nodes: [...points].map(([index, point]) =>
      pageNode(
        style,
        index,
        point,
        (hops.get(index) ?? 0) <= 1 || top.has(index),
      ),
    ),
    edges: aggregateEdges(model.edges, (index) =>
      hops.has(index) ? (model.ids[index] ?? null) : null,
    ),
  }
}
