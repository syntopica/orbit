import type { WorkerQueue, WorkerView } from '@orbit/contract'

export const workerQueue = (
  overrides: Partial<WorkerQueue> = {},
): WorkerQueue => ({
  name: 'queue.a',
  queued: 0,
  live: 0,
  failed: 0,
  succeeded: 0,
  oldestQueuedMs: null,
  done1h: 0,
  ...overrides,
})

export const workerView = (
  overrides: Partial<WorkerView> = {},
): WorkerView => ({
  now: 1_790_000_000_000,
  queues: [],
  nodes: [],
  cooldowns: [],
  failures: [],
  ...overrides,
})
