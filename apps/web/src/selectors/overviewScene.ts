import { LABELLED_NODES } from '../charts/labelledNodes'
import { spreadOverlaps } from '../graph/spreadOverlaps'
import type { GraphScene } from '../types/GraphScene'
import type { SceneStyle } from '../types/SceneStyle'
import { aggregateEdges } from './aggregateEdges'
import { clusterNode } from './clusterNode'
import { drawnAsMap } from './drawnAsMap'
import { groupClusters } from './groupClusters'
import { openClusterPages } from './openClusterPages'

// The overview: one node per community, at most one community opened into
// its pages; links between communities fold into one weighted edge.
export const overviewScene = (
  style: SceneStyle,
  allowed: readonly boolean[],
  open: number | null,
): GraphScene => {
  const groups = groupClusters(style.layout.community, allowed)
  const drawnAs = drawnAsMap(groups, style.model.ids, open)
  const nodes = groups.flatMap((group, rank) =>
    group.key === open
      ? openClusterPages(style, group)
      : [clusterNode(style, group, rank < LABELLED_NODES)],
  )
  return {
    nodes: spreadOverlaps(nodes),
    edges: aggregateEdges(
      style.model.edges,
      (index) => drawnAs.get(index) ?? null,
    ),
  }
}
