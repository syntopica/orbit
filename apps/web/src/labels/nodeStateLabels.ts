import type { NodeState } from '../types/NodeState'

export const NODE_STATE_LABELS: Record<NodeState, string> = {
  ready: 'able to work',
  blocked: 'blocked',
  offline: 'offline',
}
