import type { WorkerActivity } from '@orbit/contract'

// Every bucket from the one holding `since` to the one holding `now`,
// aligned as the coordinator aligns them (epoch multiples of the width).
export const bucketStarts = (view: WorkerActivity): number[] => {
  const first = Math.floor(view.since / view.bucketMs) * view.bucketMs
  const count = Math.floor((view.now - first) / view.bucketMs) + 1
  return Array.from(
    { length: Math.max(0, count) },
    (_, i) => first + i * view.bucketMs,
  )
}
