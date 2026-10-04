import { CLUSTER_PREFIX } from './clusterPrefix'

// The community key behind a cluster node id, or null for a page id.
export const readClusterId = (id: string): number | null => {
  if (!id.startsWith(CLUSTER_PREFIX)) return null
  const key = Number(id.slice(CLUSTER_PREFIX.length))
  return Number.isInteger(key) ? key : null
}
