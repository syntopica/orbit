import type { WorkerNode } from '@orbit/contract'

import type { NodeState } from '../types/NodeState'
import { isNodeStale } from './isNodeStale'
import { nodeBlockers } from './nodeBlockers'

export const nodeState = (node: WorkerNode): NodeState => {
  if (isNodeStale(node)) return 'offline'
  return nodeBlockers(node).length > 0 ? 'blocked' : 'ready'
}
