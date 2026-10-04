import { clusterNodeId } from '../graph/clusterNodeId'
import type { ClusterGroup } from '../types/ClusterGroup'

// The node each grouped page is drawn as: itself in the open community, the
// community's node otherwise.
export const drawnAsMap = (
  groups: readonly ClusterGroup[],
  ids: readonly string[],
  open: number | null,
): ReadonlyMap<number, string> =>
  new Map(
    groups.flatMap((group) =>
      group.members.map((member): [number, string] => [
        member,
        group.key === open ? (ids[member] ?? '') : clusterNodeId(group.key),
      ]),
    ),
  )
