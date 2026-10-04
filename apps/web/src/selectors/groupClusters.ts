import { LOOSE_CLUSTER } from '../charts/looseCluster'
import type { ClusterGroup } from '../types/ClusterGroup'

// Louvain communities among the allowed pages, largest first (ties by key);
// communities of one page fold into one group, so loose pages are one node.
export const groupClusters = (
  community: readonly number[],
  allowed: readonly boolean[],
): readonly ClusterGroup[] => {
  const byKey = new Map<number, number[]>()
  community.forEach((key, index) => {
    if (allowed[index] !== true) return
    const members = byKey.get(key) ?? []
    members.push(index)
    byKey.set(key, members)
  })
  const groups = [...byKey]
    .filter(([, members]) => members.length > 1)
    .map(([key, members]) => ({ key, members }))
  const loose = [...byKey.values()]
    .filter((members) => members.length === 1)
    .flat()
  if (loose.length > 0)
    groups.push({
      key: LOOSE_CLUSTER,
      members: loose.toSorted((a, b) => a - b),
    })
  return groups.toSorted(
    (a, b) => b.members.length - a.members.length || a.key - b.key,
  )
}
