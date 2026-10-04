import type { SnapshotCore } from '@orbit/contract'

// True when any waiting clip group's oldest item is older than the limit.
export const clipsOldestOver = (
  pending: SnapshotCore['pending'],
  limitDays: number | undefined,
  now: Date,
): boolean =>
  limitDays !== undefined &&
  pending.some(
    (row) =>
      row.oldestAt !== null &&
      now.getTime() - Date.parse(row.oldestAt) > limitDays * 86_400_000,
  )
