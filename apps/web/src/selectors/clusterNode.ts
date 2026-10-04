import { clusterSize } from '../charts/clusterSize'
import { LOOSE_CLUSTER } from '../charts/looseCluster'
import { formatClusterLabel } from '../formatters/formatClusterLabel'
import { centroid } from '../geometry/centroid'
import { clusterNodeId } from '../graph/clusterNodeId'
import type { ClusterGroup } from '../types/ClusterGroup'
import type { SceneNode } from '../types/SceneNode'
import type { SceneStyle } from '../types/SceneStyle'
import { dominantSlot } from './dominantSlot'
import { mostLinked } from './mostLinked'

// A community collapsed into one node at the centre of its pages, sized by
// page count and coloured by the slot most of its pages wear.
export const clusterNode = (
  style: SceneStyle,
  group: ClusterGroup,
  forceLabel: boolean,
): SceneNode => {
  const { model, palette } = style
  const [lead] = mostLinked(group.members, model.degree, 1)
  const slot = dominantSlot(group.members, style.slots)
  return {
    id: clusterNodeId(group.key),
    label: formatClusterLabel(
      group.key === LOOSE_CLUSTER ? null : (model.ids[lead ?? 0] ?? ''),
      group.members.length,
    ),
    ...centroid(group.members, style.layout),
    size: clusterSize(group.members.length),
    color: palette.series[slot - 1] ?? palette.line,
    forceLabel,
  }
}
