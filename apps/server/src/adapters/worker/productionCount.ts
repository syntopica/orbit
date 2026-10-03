import type { WorkerStatus } from '../../types/WorkerStatus'

// Shadow copies and their judges are sampling, not production work: a shadow
// pinned to a resting executor may wait for days, and its failures lose nothing.
export const productionCount = (
  queue: WorkerStatus['queues'][string],
  state: string,
): number => {
  const count = queue.states[state] ?? 0
  const sampling =
    state === 'failed'
      ? (queue.sampling_failed ?? 0)
      : state === 'queued'
        ? (queue.sampling_queued ?? 0)
        : 0
  return Math.max(0, count - sampling)
}
