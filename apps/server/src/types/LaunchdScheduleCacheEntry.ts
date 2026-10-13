import type { LaunchdSchedule } from './LaunchdSchedule'

export type LaunchdScheduleCacheEntry = {
  readonly schedule: LaunchdSchedule
  readonly at: number
}
