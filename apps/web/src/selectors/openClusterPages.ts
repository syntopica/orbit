import { LABELLED_NODES } from '../charts/labelledNodes'
import type { ClusterGroup } from '../types/ClusterGroup'
import type { SceneNode } from '../types/SceneNode'
import type { SceneStyle } from '../types/SceneStyle'
import { mostLinked } from './mostLinked'
import { pageNode } from './pageNode'

// The pages of the opened community at their global layout positions.
export const openClusterPages = (
  style: SceneStyle,
  group: ClusterGroup,
): readonly SceneNode[] => {
  const top = mostLinked(group.members, style.model.degree, LABELLED_NODES)
  return group.members.map((index) =>
    pageNode(
      style,
      index,
      { x: style.layout.x[index] ?? 0, y: style.layout.y[index] ?? 0 },
      top.has(index),
    ),
  )
}
