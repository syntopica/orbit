import type { WorkerNode } from '@orbit/contract'

export const workerNode = (
  overrides: Partial<WorkerNode> = {},
): WorkerNode => ({
  name: 'node-a',
  reason: null,
  idleMs: 3_600_000,
  onAc: true,
  pressure: 'normal',
  resident: [],
  reportAgeMs: 5000,
  lastRelease: null,
  ...overrides,
})
