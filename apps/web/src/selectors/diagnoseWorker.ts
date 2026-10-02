import type { WorkerView } from '@orbit/contract'

import type { WorkerBlocker } from '../types/WorkerBlocker'
import type { WorkerDiagnosis } from '../types/WorkerDiagnosis'
import { nodeBlockers } from './nodeBlockers'

// Why is work waiting? Asked whenever something is queued: even while one job
// runs, a cooling runner or a busy node is why the rest waits.
export const diagnoseWorker = (view: WorkerView): WorkerDiagnosis => {
  const queued = view.queues.reduce((sum, q) => sum + q.queued, 0)
  const live = view.queues.reduce((sum, q) => sum + q.live, 0)
  if (queued === 0) return { state: 'idle', queued, live, blockers: [] }
  const cooldowns = view.cooldowns.map((c): WorkerBlocker => ({
    kind: 'cooldown',
    subject: c.runner,
    ms: Math.max(0, c.availableAt - view.now),
    code: null,
  }))
  const nodes: WorkerBlocker[] =
    view.nodes.length === 0
      ? [{ kind: 'no_nodes', subject: null, ms: null, code: null }]
      : view.nodes.flatMap(nodeBlockers)
  const blockers = [...cooldowns, ...nodes]
  return { state: live > 0 ? 'working' : 'blocked', queued, live, blockers }
}
