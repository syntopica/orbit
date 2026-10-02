import type { WorkerBlocker } from '../types/WorkerBlocker'

export const BLOCKER_LABELS: Record<WorkerBlocker['kind'], string> = {
  cooldown: 'available in',
  stale: 'last reported',
  in_use: 'is in use, works when idle',
  battery: 'is on battery',
  pressure: 'is under memory pressure',
  blocked: 'cannot take work:',
  no_nodes: 'No node has reported, so nothing can run.',
}
