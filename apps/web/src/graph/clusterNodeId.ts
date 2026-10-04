import { CLUSTER_PREFIX } from './clusterPrefix'

export const clusterNodeId = (key: number): string =>
  `${CLUSTER_PREFIX}${String(key)}`
